import PD from 'probability-distributions';
import AppUtility from '../../utility/AppUtility.class.mjs';
import Peer from './Peer.class.mjs';
import AppConfig from '../../constant/AppConfig.constant.mjs';
import FileGenerator from '../../utility/FileGenerator.class.mjs';

class DataOwner extends Peer {
  constructor(name) {
    super(name);
    this.numOwnedFiles = Math.round(PD.rnorm(
      1,
      AppConfig.DATA_OWNER.NUM_OWNED_FILES.MEAN,
      AppConfig.DATA_OWNER.NUM_OWNED_FILES.STD,
    ));
    this.files = [];
    this.genFileTimeout = undefined;
    this.startGenFile(AppConfig.DATA_OWNER.FILE_OCCUR_AVG_PERIOD);
  }
  printInfo() {
    super.printInfo();
    console.log(`${'File-to-upload Occur Rate'.padEnd(AppConfig.GENERAL.LOG_PAD)}: ${AppUtility.toFixedDecimal(this.fileToUploadOccurRate)} file/s`);
  }
  startGenFile(avgPeriod) {
    this.recursivelyGenFile(avgPeriod);
  }
  stopGenFile() {
    if (this.genFileTimeout === undefined) {
      return;
    }
    clearTimeout(this.genFileTimeout);
    this.genFileTimeout = undefined;
  }
  recursivelyGenFile(avgPeriod) {
    const newFile = FileGenerator.generateFile(Math.round(PD.rnorm(
      1,
      AppConfig.DATA_OWNER.FILE_SIZE.MEAN,
      AppConfig.DATA_OWNER.FILE_SIZE.STD,
    )));
    if (this.files.length >= this.numOwnedFiles) {
      this.files.splice(Math.floor(Math.random() * Math.floor(this.numOwnedFiles)), 1);
    }
    this.files.push(newFile);

    // console.log(`File generated: ${newFile.content}`);
    // console.log(`File binHash: ${newFile.binHash}`);
    // console.log(`file gen with ${this.files.length} owned`);
    this.genFileTimeout = setTimeout(
      () => {
        this.recursivelyGenFile(avgPeriod);
      },
      PD.rpois(1, avgPeriod / 1000) * 1000,
    );
  }
}

export default DataOwner;
