// import DataOwner from './src/class/peer/DataOwner.class.mjs';
// import ShardKeeper from './src/class/peer/ShardKeeper.class.mjs';
import Farmer from './src/class/peer/Farmer.class.mjs';
import AppConfig from './src/constant/AppConfig.constant.mjs';

console.log('\n\nWelcom to DiskFarm~');
console.log('Simulation Started.');

console.log('\nCreating peers...');

// const dataOwners = [];
// for (let i = 0; i < AppConfig.DATA_OWNER.TOTAL_NUM; i += 1) {
//   dataOwners.push(new DataOwner());
//   dataOwners[dataOwners.length - 1].printInfo();
// }

// const shardKeepers = [];
// for (let i = 0; i < AppConfig.SHARD_KEEPER.TOTAL_NUM; i += 1) {
//   shardKeepers.push(new ShardKeeper());
//   shardKeepers[shardKeepers.length - 1].printInfo();
// }

const farmers = [];
for (let i = 0; i < AppConfig.FARMER.TOTAL_NUM; i += 1) {
  farmers.push(new Farmer());
  farmers[farmers.length - 1].printInfo();
}

