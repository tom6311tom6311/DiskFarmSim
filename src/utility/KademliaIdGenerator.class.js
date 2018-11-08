import BigNum from 'bignum';
import AppConfig from '../constant/AppConfig.constant';

const ID_RANGE = new BigNum(2).pow(AppConfig.KADEMLIA.ID_LENGTH);

class KademliaIdGenerator {
  constructor() {
    this.generatedIdStrs = [];
  }

  generateId() {
    let newId = null;
    do {
      newId = BigNum.rand(ID_RANGE);
    } while (this.generatedIdStrs.includes(newId.toString()));
    this.generatedIdStrs.push(newId.toString());
    return newId;
  }
}

export default new KademliaIdGenerator();
