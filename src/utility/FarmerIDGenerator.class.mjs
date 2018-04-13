import colors from 'colors';
import BigNum from 'bignum';
import AppConfig from '../constant/AppConfig.constant.mjs';

class FarmerIDGenerator {
  constructor() {
    this.currentID = new BigNum(0);
    this.maxID = new BigNum(2).pow(AppConfig.FARMER.ID_LENGTH).sub(1);
  }
  generateFarmerID() {
    if (this.currentID.gt(this.maxID)) {
      console.error(colors.red('Max num of peers attached!'));
      return new BigNum(-1);
    }
    const ret = this.currentID;
    this.currentID = this.currentID.add(1);
    return ret;
  }
}

const farmerIDGenerator = new FarmerIDGenerator();

export default farmerIDGenerator;
