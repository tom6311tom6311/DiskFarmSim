import colors from 'colors';
import AppConfig from '../constant/AppConfig.constant.mjs';
import DataOwner from '../class/peer/DataOwner.class.mjs';
import ShardKeeper from '../class/peer/ShardKeeper.class.mjs';
import Farmer from '../class/peer/Farmer.class.mjs';

class PeerManager {
  constructor() {
    this.dataOwners = {};
    this.shardKeepers = {};
    this.farmers = {};
  }

  initPeers(nDataOwner, nShardKeeper, nFarmer) {
    console.log(colors.green('\n\n### Initializatiing Peers ###\n'));
    for (let i = 0; i < nDataOwner; i += 1) {
      const name = `DO${i.toString()}`;
      this.dataOwners[name] = new DataOwner(name);
    }

    for (let i = 0; i < nShardKeeper; i += 1) {
      const name = `SK${i.toString()}`;
      this.shardKeepers[name] = new ShardKeeper(name);
    }

    for (let i = 0; i < nFarmer; i += 1) {
      const name = `F${i.toString()}`;
      this.farmers[name] = new Farmer(name);
      if (AppConfig.KADEMLIA.ALLOW_RANDOM_NODE_LOOKUP) {
        setTimeout(() => {
          this.farmers[name]
            .kademliaAgent
            .startRandomNodeLookup(AppConfig.KADEMLIA.RANDOM_NODE_LOOKUP_AVG_PERIOD);
        }, 1000);
      }
    }
    console.log(colors.green('\n### Initialization Finished ###\n'));
  }

  listPeerStatus() {
    console.log(colors.green('\n### Peer Status ###'));
    console.log(colors.green(`${'Name'.padEnd(AppConfig.GENERAL.LOG_PAD_SHORT)}| ${'Type'.padEnd(AppConfig.GENERAL.LOG_PAD_SHORT)}| ${'IP'.padEnd(AppConfig.GENERAL.LOG_PAD_SHORT)}| ${'Is Online'.padEnd(AppConfig.GENERAL.LOG_PAD_SHORT)}`));
    Object.entries(this.dataOwners).forEach(([name, dataOwner]) => {
      const { ip, isOnline } = dataOwner.getInfo();
      console.log(colors.green(`${name.padEnd(AppConfig.GENERAL.LOG_PAD_SHORT)}| ${'Data Owner'.padEnd(AppConfig.GENERAL.LOG_PAD_SHORT)}| ${ip.padEnd(AppConfig.GENERAL.LOG_PAD_SHORT)}| ${isOnline.toString().padEnd(AppConfig.GENERAL.LOG_PAD_SHORT)}`));
    });
    Object.entries(this.shardKeepers).forEach(([name, shardKeeper]) => {
      const { ip, isOnline } = shardKeeper.getInfo();
      console.log(colors.green(`${name.padEnd(AppConfig.GENERAL.LOG_PAD_SHORT)}| ${'Shard Keeper'.padEnd(AppConfig.GENERAL.LOG_PAD_SHORT)}| ${ip.padEnd(AppConfig.GENERAL.LOG_PAD_SHORT)}| ${isOnline.toString().padEnd(AppConfig.GENERAL.LOG_PAD_SHORT)}`));
    });
    Object.entries(this.farmers).forEach(([name, farmer]) => {
      const { ip, isOnline } = farmer.getInfo();
      console.log(colors.green(`${name.padEnd(AppConfig.GENERAL.LOG_PAD_SHORT)}| ${'Farmer'.padEnd(AppConfig.GENERAL.LOG_PAD_SHORT)}| ${ip.padEnd(AppConfig.GENERAL.LOG_PAD_SHORT)}| ${isOnline.toString().padEnd(AppConfig.GENERAL.LOG_PAD_SHORT)}`));
    });
    console.log('\n');
  }

  ping(from, to) {
    if (!(from in this.farmers) || !(to in this.farmers)) {
      console.log(colors.red('ERROR: PING action can only be performed between farmers'));
      return;
    }
    this.farmers[from].ping(this.farmers[to]);
  }

  printInfo(name) {
    if (!name) {
      console.log(colors.red('ERROR: peer name undefined'));
      return;
    }

    if (name in this.dataOwners) {
      this.dataOwners[name].printInfo();
    } else if (name in this.shardKeepers) {
      this.shardKeepers[name].printInfo();
    } else if (name in this.farmers) {
      this.farmers[name].printInfo();
    } else {
      console.log(colors.red(`ERROR: peer ${name} not found`));
    }
  }
}

export default new PeerManager();
