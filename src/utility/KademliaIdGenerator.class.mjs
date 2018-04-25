import colors from 'colors';
import BigNum from 'bignum';
import AppConfig from '../constant/AppConfig.constant.mjs';

class KademliaIdGenerator {
  constructor() {
    this.currentId = new BigNum(0);
    this.maxId = new BigNum(2).pow(AppConfig.KADEMLIA.ID_LENGTH).sub(1);
  }

  generateId() {
    if (this.currentId.gt(this.maxId)) {
      console.error(colors.red('Max num of peers attached!'));
      return new BigNum(-1);
    }
    const selfId = this.currentId;
    this.currentId = this.currentId.add(1);
    return selfId;
  }
}

export default new KademliaIdGenerator();
