import PD from 'probability-distributions';
import AppUtility from '../../utility/AppUtility.class';
import Peer from './Peer.class';
import AppConfig from '../../constant/AppConfig.constant';
import FileGenerator from '../../utility/FileGenerator.class';
import KademliaAgent from '../kademlia/KademliaAgent.class';

class DataOwner extends Peer {
  constructor(name) {
    super(name);
    if (AppConfig.POLICY === 'VANILLA_KADEMLIA') {
      this.kademliaAgent = new KademliaAgent(super.getInfo().ip, name, 0);
      this.id = this.kademliaAgent.getId();
    }
    this.numOwnedFiles = Math.round(PD.rnorm(
      1,
      AppConfig.DATA_OWNER.NUM_OWNED_FILES.MEAN,
      AppConfig.DATA_OWNER.NUM_OWNED_FILES.STD,
    ));
    this.files = [];
    this.genFileTimeout = undefined;
    this.retrieveFileTimeout = undefined;

    setTimeout(() => {
      this.startGenFile(AppConfig.DATA_OWNER.FILE_OCCUR_AVG_PERIOD);
      this.startRetrieveFile(AppConfig.DATA_OWNER.FILE_RETRIEVE_AVG_PERIOD);
    }, 1000);
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

    if (AppConfig.POLICY === 'VANILLA_KADEMLIA') {
      this.kademliaAgent.upload(newFile.binHash, newFile.content);
    }

    this.genFileTimeout = setTimeout(
      () => {
        this.recursivelyGenFile(avgPeriod);
      },
      PD.rpois(1, avgPeriod / 1000) * 1000,
    );
  }

  startRetrieveFile(avgPeriod) {
    this.recursivelyRetrieveFile(avgPeriod);
  }

  stopRetrieveFile() {
    if (this.retrieveFileTimeout === undefined) {
      return;
    }
    clearTimeout(this.retrieveFileTimeout);
    this.retrieveFileTimeout = undefined;
  }

  recursivelyRetrieveFile(avgPeriod) {
    console.log('retrieving file...');
    const file = this.files[Math.floor(Math.random() * this.files.length)];

    if (AppConfig.POLICY === 'VANILLA_KADEMLIA') {
      this.kademliaAgent.download(file.binHash, (content) => {
        if (content === file.content) {
          console.log('success');
        } else {
          console.log('failed');
        }
      });
    }

    this.retrieveFileTimeout = setTimeout(
      () => {
        this.recursivelyRetrieveFile(avgPeriod);
      },
      PD.rpois(1, avgPeriod / 1000) * 1000,
    );
  }
}

export default DataOwner;
