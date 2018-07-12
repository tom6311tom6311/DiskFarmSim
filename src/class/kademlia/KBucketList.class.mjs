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
    if (bucketId === -1) {
      return;
    }
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
    if (bucketId < 0 || position < 0 || this.bucketList[bucketId].length <= position) {
      return;
    }
    const bucket = this.bucketList[bucketId];
    this.bucketList[bucketId] = bucket.concat(bucket.splice(position, 1));
  }

  removePeerRecord(bucketId, position) {
    if (bucketId < 0 || position < 0 || this.bucketList[bucketId].length <= position) {
      return;
    }
    this.bucketList[bucketId].splice(position, 1);
  }

  findPeerRecord(peerId) {
    let distance = this.selfId.xor(peerId);
    let bucketId = -1;
    while (distance.gt(0)) {
      distance = distance.shiftRight(1);
      bucketId += 1;
    }
    const position = bucketId === -1 ?
      -1 :
      this.bucketList[bucketId].findIndex(rec => rec.peerId.eq(peerId));
    return { bucketId, position };
  }

  getPeerRecord(bucketId, position) {
    return this.bucketList[bucketId][position];
  }

  isBucketFull(bucketId) {
    return this.bucketList[bucketId].length >= this.size.k;
  }

  getBucketContent() {
    return this.bucketList.map(bucket => bucket.map(record => record.name));
  }

  findClosestRecords(id) {
    const { bucketId } = this.findPeerRecord(id);
    let closestRecords = this.bucketList[bucketId] || [];
    let tmpBucketId = bucketId - 1;
    while (closestRecords.length < this.size.k && tmpBucketId >= 0) {
      closestRecords = closestRecords.concat(this.bucketList[tmpBucketId]);
      tmpBucketId -= 1;
    }
    tmpBucketId = bucketId + 1;
    while (closestRecords.length < this.size.k && tmpBucketId < this.size.l) {
      closestRecords = closestRecords.concat(this.bucketList[tmpBucketId]);
      tmpBucketId += 1;
    }
    if (closestRecords.length > this.size.k) {
      closestRecords = closestRecords.slice(0, this.size.k);
    }
    return closestRecords;
  }
}

export default KBucketList;
