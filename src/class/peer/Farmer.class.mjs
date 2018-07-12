import Peer from './Peer.class.mjs';
import KademliaAgent from '../kademlia/KademliaAgent.class.mjs';

class Farmer extends Peer {
  constructor(name) {
    super(name);
    this.kademliaAgent = new KademliaAgent(super.getInfo().ip, name);
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
