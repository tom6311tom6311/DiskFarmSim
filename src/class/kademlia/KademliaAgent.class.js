import PD from 'probability-distributions';
import BigNum from 'bignum';
import AppConfig from '../../constant/AppConfig.constant';
import KBucketList from './KBucketList.class';
import KademliaIdGenerator from '../../utility/KademliaIdGenerator.class';
import NetworkService from '../../utility/NetworkService.class';
import MessageType from '../../constant/MessageType.constant';
import PeerRecord from './PeerRecord.class';
import Server from '../../utility/Server.class';

class KademliaAgent {
  constructor(selfIp, selfName, capacity) {
    this.selfId = KademliaIdGenerator.generateId();
    this.selfIp = selfIp;
    this.selfName = selfName;
    this.capacity = capacity;
    this.storage = [];
    this.kBucketList = new KBucketList(
      this.selfId,
      AppConfig.KADEMLIA.ID_LENGTH,
      AppConfig.KADEMLIA.BUCKET_K,
    );
    this.lookUpMemory = null;
    this.cleanLookUpMemoryTimeout = undefined;
    this.randomNodeLookUpTimeout = undefined;
    this.isQueryingLeastRecentNode = false;
    this.downloadingHashes = [];

    Server.addTopoGraphNode(this.selfName);
    setTimeout(this.bootStrap.bind(this), 1000);
  }

  getId() {
    return this.selfId;
  }

  printInfo() {
    console.log(`${'Kademlia ID'.padEnd(AppConfig.GENERAL.LOG_PAD)}: #${this.selfId.toString().padStart(AppConfig.KADEMLIA.ID_LENGTH, '0')}`);
    console.log('Bucket Content');
    this.kBucketList.getBucketContent().forEach((bucket, idx) => {
      console.log(`${`  Bucket #${idx.toString().padStart(3, '0')}`.padEnd(AppConfig.GENERAL.LOG_PAD)}: ${bucket}`);
    });
  }

  bootStrap() {
    const bootStrapPeer = NetworkService.getRandomHost();
    if (bootStrapPeer === undefined || bootStrapPeer.ip === this.selfIp) {
      setTimeout(() => {
        this.bootStrap();
      }, 1000);
      return;
    }
    this.ping(bootStrapPeer.ip, (peer) => {
      this.updatePeerRecord(peer);
      this.startNodeLookUp(this.selfId);
    }, () => {
      setTimeout(() => {
        this.bootStrap();
      }, 1000);
    });
  }

  startNodeLookUp(targetId, callback = () => {}) {
    if (this.lookUpMemory !== null) {
      return false;
    }
    // const { bucketId, position } = this.kBucketList.findPeerRecord(targetId);
    // if (bucketId !== -1 && position !== -1) {
    //   return false;
    // }
    const closestRecords = this.kBucketList.findClosestRecords(targetId);
    this.lookUpMemory = closestRecords.map(record => ({
      ...record,
      visiting: false,
      visited: false,
    }));
    // console.log(`${this.selfId} start to lookup ${targetId}`);
    this.nodeLookUp(targetId, callback);
    return true;
  }

  nodeLookUp(targetId, callback) {
    const toVisit = this.lookUpMemory
      .filter(record => (!record.visiting))
      .slice(0, AppConfig.KADEMLIA.NODE_LOOKUP_ALPHA);
    toVisit.forEach((record, idx) => {
      // console.log(`${this.selfId} visit ${record.peerId}`);
      if (record.visiting) {
        return;
      }
      toVisit[idx].visiting = true;
      this.sendFindNode(record, targetId, (sender, { closestRecords }) => {
        this.updatePeerRecord(sender);
        if (this.lookUpMemory === null) {
          return;
        }
        const idsInMemory = this.lookUpMemory.map(r => r.peerId.toString());
        const newRecordsFound = closestRecords
          .filter(r => !(idsInMemory.includes(r.peerId.toString()) || r.peerId.eq(this.selfId)))
          .map(r => ({
            ...r,
            visiting: false,
            visited: false,
          }));
        this.lookUpMemory = this.lookUpMemory
          .concat(newRecordsFound);
        this.lookUpMemory = this.lookUpMemory
          .sort((a, b) => {
            const diff = a.peerId.xor(targetId).sub(b.peerId.xor(targetId));
            return diff.gt(0) ? 1 : -1;
          });
        this.lookUpMemory = this.lookUpMemory
          .slice(0, AppConfig.KADEMLIA.BUCKET_K);
        toVisit[idx].visited = true;
        // console.log(`${this.selfId} receive ${sender.id}`);
        setTimeout(() => {
          const notVisiting = this.lookUpMemory
            .filter(r => (!r.visiting));
          if (notVisiting.length === 0) {
            this.fireLookUpMemoryCleaner(callback);
          } else {
            this.nodeLookUp(targetId, callback);
          }
        });
      });
    });
    this.fireLookUpMemoryCleaner(callback);
  }

  fireLookUpMemoryCleaner(callback) {
    if (this.cleanLookUpMemoryTimeout !== undefined) {
      clearTimeout(this.cleanLookUpMemoryTimeout);
    }
    this.cleanLookUpMemoryTimeout = setTimeout(() => {
      this.lookUpMemory = null;
      this.cleanLookUpMemoryTimeout = undefined;
      // console.log(`${this.selfId} lookup finished ${targetId}`);
      callback();
    }, AppConfig.KADEMLIA.CLEAN_MEMORY_TIMEOUT);
  }

  recursivelyLookUpRandomTarget(avgPeriod) {
    if (this.kBucketList.isAllBucketEmpty()) {
      this.bootStrap();
    } else {
      const receiver = NetworkService.getRandomHost();
      if (receiver !== undefined && !(receiver.id.eq(this.selfId))) {
        this.startNodeLookUp(receiver.id);
      }
    }
    this.randomNodeLookUpTimeout = setTimeout(
      () => {
        this.recursivelyLookUpRandomTarget(avgPeriod);
      },
      PD.rpois(1, avgPeriod / 1000) * 1000,
    );
  }

  startRandomNodeLookup(avgPeriod) {
    this.recursivelyLookUpRandomTarget(avgPeriod);
  }

  stopRandomNodeLookup() {
    if (this.randomNodeLookUpTimeout === undefined) {
      return;
    }
    clearTimeout(this.randomNodeLookUpTimeout);
    this.randomNodeLookUpTimeout = undefined;
  }

  ping(peerIp, callback, failCallback) {
    NetworkService.sendMessage({
      fromIp: this.selfIp,
      toIp: peerIp,
      message: {
        type: MessageType.PING,
      },
      callback,
      failCallback,
    });
  }

  responsePing(peer, connectionId) {
    this.updatePeerRecord(peer);
    NetworkService.sendMessage({
      fromIp: this.selfIp,
      toIp: peer.ip,
      message: {
        type: MessageType.RESP_PING,
      },
      connectionId,
    });
  }

  updatePeerRecord(peer) {
    if (this.isQueryingLeastRecentNode) {
      return;
    }
    const { bucketId, position } = this.kBucketList.findPeerRecord(peer.id);
    if (position === -1) {
      const newPeerRecord = new PeerRecord(peer.name, peer.id, peer.ip);
      if (this.kBucketList.isBucketFull(bucketId)) {
        this.isQueryingLeastRecentNode = true;
        this.ping(this.kBucketList.bucketList[bucketId][0].ip, () => {
          this.kBucketList.movePeerRecordToEnd(bucketId, 0);
          this.isQueryingLeastRecentNode = false;
        }, () => {
          Server.deleteTopoGraphEdge(this.selfName, this.kBucketList.bucketList[bucketId][0].name);
          this.kBucketList.appendPeerRecord(bucketId, newPeerRecord, true);
          Server.addTopoGraphEdge(this.selfName, peer.name);
        });
      } else {
        this.kBucketList.appendPeerRecord(bucketId, newPeerRecord, false);
        Server.addTopoGraphEdge(this.selfName, peer.name);
      }
    } else {
      this.kBucketList.movePeerRecordToEnd(bucketId, position);
    }
  }

  upload(binHash, content) {
    const callback = () => {
      const binHashNum = new BigNum(parseInt(binHash, 2));
      const closestRecords = this.kBucketList.findClosestRecords(binHashNum);
      closestRecords.forEach((record) => {
        this.sendStore(record, binHashNum, content);
      });
    };
    const success = this.startNodeLookUp(new BigNum(parseInt(binHash, 2)), callback);
    if (!success) {
      setTimeout(() => {
        this.upload(binHash, content);
      }, 100);
    }
  }

  download(binHash, callback = () => {}) {
    const idx = this.downloadingHashes.findIndex(h => h === binHash);
    if (idx !== -1) {
      console.log('already finding');
      return;
    }
    const lookupCallback = () => {
      const binHashNum = new BigNum(parseInt(binHash, 2));
      const closestRecords = this.kBucketList.findClosestRecords(binHashNum);
      // console.log(closestRecords);
      if (closestRecords.length === 0) {
        callback(undefined);
        return;
      }
      closestRecords.forEach((record) => {
        this.sendFindValue(record, binHashNum, (sender, { value }) => {
          const downloadingIdx = this.downloadingHashes.findIndex(h => h === binHash);
          if (value !== undefined && downloadingIdx !== -1) {
            callback(value);
            this.downloadingHashes.splice(downloadingIdx, 1);
          }
        });
      });
    };
    const success = this.startNodeLookUp(new BigNum(parseInt(binHash, 2)), lookupCallback);
    if (!success) {
      console.log('keep trying...');
      setTimeout(() => {
        this.download(binHash, callback);
      }, 100);
    } else {
      this.downloadingHashes.push(binHash);
    }
  }

  sendStore(peer, binHashNum, content) {
    NetworkService.sendMessage({
      fromIp: this.selfIp,
      toIp: peer.ip,
      message: {
        type: MessageType.STORE,
        binHashNum,
        content,
      },
    });
  }

  store(binHashNum, content) {
    const timeNow = Date.now();
    this.storage = this.storage
      .filter(e => (timeNow - e.timeLastUpdate < AppConfig.KADEMLIA.KEEP_VALUE_TIMEOUT));
    const idx = this.storage.findIndex(e => (e.binHashNum.eq(binHashNum)));
    if (idx !== -1) {
      this.storage[idx] = {
        ...this.storage[idx],
        content,
        timeLastUpdate: timeNow,
      };
    } else if (this.storage.length < this.capacity) {
      this.storage.push({
        binHashNum,
        content,
        timeLastUpdate: timeNow,
      });
    }
  }

  sendFindNode(peer, idToFind, callback, failCallback) {
    NetworkService.sendMessage({
      fromIp: this.selfIp,
      toIp: peer.ip,
      message: {
        type: MessageType.FIND_NODE,
        idToFind,
      },
      callback,
      failCallback,
    });
  }

  responseFindNode(peer, idToFind, connectionId) {
    const closestRecords = this.kBucketList.findClosestRecords(idToFind);
    NetworkService.sendMessage({
      fromIp: this.selfIp,
      toIp: peer.ip,
      message: {
        type: MessageType.RESP_FIND_NODE,
        closestRecords,
      },
      connectionId,
    });
  }

  sendFindValue(peer, binHashNum, callback, failCallback) {
    NetworkService.sendMessage({
      fromIp: this.selfIp,
      toIp: peer.ip,
      message: {
        type: MessageType.FIND_VALUE,
        binHashNum,
      },
      callback,
      failCallback,
    });
  }

  responseFindValue(peer, binHashNum, connectionId) {
    const idx = this.storage.findIndex(e => (e.binHashNum.eq(binHashNum)));
    if (idx !== -1) {
      NetworkService.sendMessage({
        fromIp: this.selfIp,
        toIp: peer.ip,
        message: {
          type: MessageType.RESP_FIND_VALUE,
          value: this.storage[idx].content,
        },
        connectionId,
      });
    } else {
      const closestRecords = this.kBucketList.findClosestRecords(binHashNum);
      NetworkService.sendMessage({
        fromIp: this.selfIp,
        toIp: peer.ip,
        message: {
          type: MessageType.RESP_FIND_VALUE,
          closestRecords,
        },
        connectionId,
      });
    }
  }

  onReceiveMessage(sender, message, connectionId) {
    switch (message.type) {
      case MessageType.PING:
        this.responsePing(sender, connectionId);
        break;
      case MessageType.FIND_NODE:
        this.responseFindNode(sender, message.idToFind, connectionId);
        break;
      case MessageType.STORE:
        this.store(message.binHashNum, message.content);
        break;
      case MessageType.FIND_VALUE:
        this.responseFindValue(sender, message.binHashNum, connectionId);
        break;
      default:
        break;
    }
  }
}

export default KademliaAgent;
