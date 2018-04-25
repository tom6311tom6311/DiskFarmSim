class IpGenerator {
  constructor() {
    this.generatedIp = [];
  }
  generateIp() {
    let newIp = '';
    do {
      newIp = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
    } while (newIp in this.generatedIp);
    this.generatedIp.push(newIp);
    return newIp;
  }
}

export default new IpGenerator();
