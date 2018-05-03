import PD from 'probability-distributions';
import AppConfig from '../../constant/AppConfig.constant.mjs';
import KBucketList from '../kademlia/KBucketList.class.mjs';
import KademliaIdGenerator from '../../utility/KademliaIdGenerator.class.mjs';
import NetworkService from '../../utility/NetworkService.class.mjs';
import MessageType from '../../constant/MessageType.constant.mjs';
import PeerRecord from '../kademlia/PeerRecord.class.mjs';

class KademliaAgent {
  constructor(selfIp) {
    this.selfId = KademliaIdGenerator.generateId();
    this.selfIp = selfIp;
    this.kBucketList = new KBucketList(
      this.selfId,
      AppConfig.KADEMLIA.ID_LENGTH,
      AppConfig.KADEMLIA.BUCKET_K,
    );
    this.lookUpMemory = {};
    this.randomNodeLookUpTimeout = undefined;
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
    let bootStrapPeer = NetworkService.getRandomHost();
    if (bootStrapPeer === undefined) {
      return;
    }
    while (bootStrapPeer.ip === this.selfIp) {
      bootStrapPeer = NetworkService.getRandomHost();
    }
    this.ping(bootStrapPeer.ip, (peer) => {
      this.updatePeerRecord(peer);
      this.startNodeLookUp(this.selfId);
    }, () => {
      this.bootStrap();
    });
  }
  startNodeLookUp(targetId) {
    const closestRecords = this.kBucketList.findClosestRecords(targetId);
    this.lookUpMemory[targetId.toString()] = closestRecords.map(record => ({
      ...record,
      visited: false,
    }));
    this.nodeLookUp(targetId);
  }
  nodeLookUp(targetId) {
    const toVisit = this.lookUpMemory[targetId.toString()]
      .filter(record => (!record.visited))
      .slice(0, AppConfig.KADEMLIA.NODE_LOOKUP_ALPHA);
    toVisit.forEach((record, idx) => {
      toVisit[idx].visited = true;
      this.ping(record.ip, (sender) => {
        this.updatePeerRecord(sender);
        this.sendFindNode(sender, targetId, (sender1, { closestRecords }) => {
          const idsInMemory = this.lookUpMemory[targetId.toString()].map(r => r.peerId);
          const newRecordsFound = closestRecords
            .filter(r => !(idsInMemory.includes(r.peerId) || r.peerId === this.selfId))
            .map(r => ({
              ...r,
              visited: false,
            }));
          this.lookUpMemory[targetId.toString()] = this.lookUpMemory[targetId.toString()]
            .concat(newRecordsFound);
          this.lookUpMemory[targetId.toString()] = this.lookUpMemory[targetId.toString()]
            .sort((a, b) => {
              const diff = a.peerId.xor(targetId).sub(b.peerId.xor(targetId));
              return diff.gt(0) ? 1 : -1;
            });
          this.lookUpMemory[targetId.toString()] = this.lookUpMemory[targetId.toString()]
            .slice(0, AppConfig.KADEMLIA.BUCKET_K);
          this.nodeLookUp(targetId);
        });
      });
    });
  }
  recursivelyLookUpRandomTarget(avgPeriod) {
    const receiver = NetworkService.getRandomHost();
    this.startNodeLookUp(receiver.id);
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
    const { bucketId, position } = this.kBucketList.findPeerRecord(peer.id);
    if (position === -1) {
      const newPeerRecord = new PeerRecord(peer.name, peer.id, peer.ip);
      this.kBucketList.appendPeerRecord(bucketId, newPeerRecord, true);
    } else {
      this.kBucketList.movePeerRecordToEnd(bucketId, position);
    }
  }
  // store() {

  // }
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
  // findValue() {

  // }
  onReceiveMessage(sender, message, connectionId) {
    switch (message.type) {
      case MessageType.PING:
        this.responsePing(sender, connectionId);
        break;
      case MessageType.FIND_NODE:
        this.responseFindNode(sender, message.idToFind, connectionId);
        break;
      default:
        break;
    }
  }
}

export default KademliaAgent;
