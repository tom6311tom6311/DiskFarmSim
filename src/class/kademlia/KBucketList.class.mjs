class KBucketList {
  constructor(selfId, l, k) {
    this.selfId = selfId;
    this.size = { l, k };
    this.initBucketList();
  }

  initBucketList() {
    this.bucketList = [];
    for (let i = 0; i < this.size.l; i += 1) {
      this.bucketList[i] = [];
    }
  }

  appendPeerRecord(bucketId, peerRecord, removeHeadIfFull = true) {
    if (this.isBucketFull(bucketId)) {
      if (removeHeadIfFull) {
        this.bucketList[bucketId].shift();
      } else {
        return;
      }
    }
    this.bucketList[bucketId].push(peerRecord);
  }

  movePeerRecordToEnd(bucketId, position) {
    const bucket = this.bucketList[bucketId];
    this.bucketList[bucketId] = bucket.concat(bucket.splice(position, 1));
  }

  findPeerRecord(peerId) {
    let distance = this.selfId.xor(peerId);
    let bucketId = -1;
    while (distance.gt(0)) {
      distance = distance.shiftRight(1);
      bucketId += 1;
    }
    const position = this.bucketList[bucketId].findIndex(rec => rec.peerId.eq(peerId));
    return { bucketId, position };
  }

  getPeerRecord(bucketId, position) {
    return this.bucketList[bucketId][position];
  }

  isBucketFull(bucketId) {
    return this.bucketList[bucketId].length >= this.size.k;
  }

  getBucketLoad() {
    return this.bucketList.map(bucket => bucket.length);
  }
}

export default KBucketList;
