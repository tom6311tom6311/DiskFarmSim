import Peer from './Peer.class';
import KademliaAgent from '../kademlia/KademliaAgent.class';
import AppConfig from '../../constant/AppConfig.constant';

class Farmer extends Peer {
  constructor(name) {
    super(name);
    this.kademliaAgent = new KademliaAgent(super.getInfo().ip, name, AppConfig.FARMER.CAPACITY);
    this.id = this.kademliaAgent.getId();
  }

  printInfo() {
    super.printInfo();
    this.kademliaAgent.printInfo();
  }

  onReceiveMessage(sender, message, connectionId) {
    super.onReceiveMessage(sender, message, connectionId);
    this.kademliaAgent.onReceiveMessage(sender, message, connectionId);
  }

  ping(peer) {
    this.kademliaAgent.ping(peer);
  }
}

export default Farmer;
