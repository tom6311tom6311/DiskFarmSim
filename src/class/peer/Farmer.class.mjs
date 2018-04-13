import AppConfig from '../../constant/AppConfig.constant.mjs';
import Peer from './Peer.class.mjs';
import KBucketList from '../kademlia/KBucketList.class.mjs';
import FarmerIDGenerator from '../../utility/FarmerIDGenerator.class.mjs';

class Farmer extends Peer {
  constructor() {
    super();
    this.farmerID = FarmerIDGenerator.generateFarmerID();
    this.kBucketList = new KBucketList(
      this.farmerID,
      AppConfig.FARMER.ID_LENGTH,
      AppConfig.FARMER.BUCKET_K,
    );
  }
  printInfo() {
    super.printInfo();
    console.log(`${'FarmerID'.padEnd(AppConfig.GENERAL.LOG_PAD)}: #${this.farmerID.toString().padStart(AppConfig.FARMER.ID_LENGTH, '0')}`);
    console.log('Bucket Load');
    this.kBucketList.getBucketLoad().forEach((load, idx) => {
      console.log(`${`  Bucket #${idx.toString().padStart(3, '0')}`.padEnd(AppConfig.GENERAL.LOG_PAD)}: ${load}/${AppConfig.FARMER.BUCKET_K}`);
    });
  }
}

export default Farmer;
