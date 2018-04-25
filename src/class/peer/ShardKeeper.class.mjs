import PD from 'probability-distributions';
import AppUtility from '../../utility/AppUtility.class.mjs';
import Peer from './Peer.class.mjs';
import AppConfig from '../../constant/AppConfig.constant.mjs';

class ShardKeeper extends Peer {
  constructor(name) {
    super(name);
    this.shardCapacity = PD.rnorm(
      1,
      AppConfig.SHARD_KEEPER.SHARD_CAPACITY.MEAN,
      AppConfig.SHARD_KEEPER.SHARD_CAPACITY.STD,
    );
  }
  printInfo() {
    super.printInfo();
    console.log(`${'Shard Capacity'.padEnd(AppConfig.GENERAL.LOG_PAD)}: ${AppUtility.toFixedDecimal(this.shardCapacity)} shards`);
  }
}

export default ShardKeeper;
