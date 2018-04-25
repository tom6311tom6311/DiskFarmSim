class NetworkService {
  constructor() {
    this.hosts = {};
    this.currConnectionId = 0;
    this.hungConnectionCallbacks = {};
  }
  registerHost(host) {
    this.hosts[host.ip] = host;
  }
  getRandomHost() {
    const hostIps = Object.keys(this.hosts);
    if (hostIps.length === 1) {
      return undefined;
    }
    return this.hosts[hostIps[Math.floor(Math.random() * hostIps.length)]];
  }
  sendMessage({
    fromIp,
    toIp,
    message,
    callback,
    failCallback,
    connectionId,
  }) {
    if (!(fromIp in this.hosts) ||
        !(toIp in this.hosts) ||
        !(this.hosts[fromIp].isOnline) ||
        !(this.hosts[toIp].isOnline)) {
      console.log('Send message failed');
      console.log(`${fromIp} ${toIp} ${JSON.stringify(message)}`);
      if (failCallback !== undefined && typeof failCallback === 'function') {
        failCallback();
      }
      return;
    }
    if (connectionId !== undefined) {
      if (this.hungConnectionCallbacks[connectionId.toString()] !== undefined) {
        this.hungConnectionCallbacks[connectionId.toString()](this.hosts[fromIp], message);
        delete this.hungConnectionCallbacks[connectionId.toString()];
      }
      if (callback !== undefined && typeof callback === 'function') {
        this.hungConnectionCallbacks[connectionId.toString()] = callback;
      }
      this.hosts[toIp].onReceiveMessage(this.hosts[fromIp], message, connectionId);
      return;
    } else if (callback !== undefined && typeof callback === 'function') {
      this.hungConnectionCallbacks[this.currConnectionId.toString()] = callback;
    }
    this.hosts[toIp].onReceiveMessage(this.hosts[fromIp], message, this.currConnectionId);
    this.currConnectionId += 1;
  }
}

export default new NetworkService();
