import bignum from 'bignum';

class PeerRecord {
  constructor(name, peerId = bignum(-1), ip = '', port = -1) {
    this.name = name;
    this.peerId = peerId;
    this.ip = ip;
    this.port = port;
  }
}

export default PeerRecord;
