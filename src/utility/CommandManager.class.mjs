import CommandType from '../constant/CommandType.constant.mjs';
import PeerManager from './PeerManager.class.mjs';

class CommandManager {
  static parse(commandStr) {
    const command = commandStr.split(' ');
    const argv = {};
    const param = [];
    let flagSeen = false;
    command.forEach((flag, idx) => {
      if (flag.startsWith('-')) {
        flagSeen = true;
        const nxt = command[idx + 1];
        if (nxt && !nxt.startsWith('-')) {
          argv[flag] = nxt;
        } else {
          argv[flag] = '';
        }
      } else {
        if (!flagSeen) {
          param.push(flag);
        }
        flagSeen = false;
      }
    });
    CommandManager.exec(command[0], argv, param);
  }
  static exec(cmd, argv, param) {
    switch (cmd) {
      case CommandType.LIST_PEERS:
        PeerManager.listPeerStatus();
        break;
      case CommandType.PING:
        PeerManager.ping(argv['-s'], argv['-d']);
        break;
      case CommandType.PRINT_INFO:
        PeerManager.printInfo(param[1]);
        break;
      default:
        break;
    }
  }
}

export default CommandManager;
