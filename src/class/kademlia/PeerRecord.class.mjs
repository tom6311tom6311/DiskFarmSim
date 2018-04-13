import bignum from 'bignum';

class PeerRecord {
  constructor(peerID = bignum(-1), ip = '', port = -1) {
    this.peerID = peerID;
    this.ip = ip;
    this.port = port;
  }
}

export default PeerRecord;
