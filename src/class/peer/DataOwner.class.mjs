import PD from 'probability-distributions';
import AppUtility from '../../utility/AppUtility.class.mjs';
import Peer from './Peer.class.mjs';
import AppConfig from '../../constant/AppConfig.constant.mjs';

class DataOwner extends Peer {
  constructor() {
    super();
    this.fileToUploadOccurRate = PD.rnorm(
      1,
      AppConfig.DATA_OWNER.FILE_TO_UPLOAD_OCCUR_RATE.MEAN,
      AppConfig.DATA_OWNER.FILE_TO_UPLOAD_OCCUR_RATE.STD,
    );
  }
  printInfo() {
    super.printInfo();
    console.log(`${'File-to-upload Occur Rate'.padEnd(AppConfig.GENERAL.LOG_PAD)}: ${AppUtility.toFixedDecimal(this.fileToUploadOccurRate)} file/s`);
  }
}

export default DataOwner;
