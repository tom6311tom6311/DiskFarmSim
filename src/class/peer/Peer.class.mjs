import PD from 'probability-distributions';
import colors from 'colors';
import AppUtility from '../../utility/AppUtility.class.mjs';
import AppConfig from '../../constant/AppConfig.constant.mjs';
import IpGenerator from '../../utility/IpGenerator.class.mjs';
import NetworkService from '../../utility/NetworkService.class.mjs';

class Peer {
  constructor(name) {
    this.name = name;
    this.ip = IpGenerator.generateIp();
    this.isOnline = true;
    this.uploadBW = PD.rnorm(1, AppConfig.PEER.UPLOAD_BW.MEAN, AppConfig.PEER.UPLOAD_BW.STD);
    this.downloadBW = PD.rnorm(1, AppConfig.PEER.DOWNLOAD_BW.MEAN, AppConfig.PEER.DOWNLOAD_BW.STD);
    this.churnProb = {
      onToOff: PD.rnorm(
        1,
        AppConfig.PEER.CHURN_PROB.ON_TO_OFF.MEAN,
        AppConfig.PEER.CHURN_PROB.ON_TO_OFF.STD,
      ),
      offToOn: PD.rnorm(
        1,
        AppConfig.PEER.CHURN_PROB.OFF_TO_ON.MEAN,
        AppConfig.PEER.CHURN_PROB.OFF_TO_ON.STD,
      ),
    };
    NetworkService.registerHost(this);
    setInterval(this.churn.bind(this), 1000);
  }
  getInfo() {
    return {
      name: this.name,
      ip: this.ip,
      isOnline: this.isOnline,
      uploadBW: this.uploadBW,
      downloadBW: this.downloadBW,
      churnProb: this.churnProb,
    };
  }
  printInfo() {
    console.log(colors.green('\n\n###   Peer Info   ###'));
    console.log(`${'Name'.padEnd(AppConfig.GENERAL.LOG_PAD)}: ${this.name}`);
    console.log(`${'IP Address'.padEnd(AppConfig.GENERAL.LOG_PAD)}: ${this.ip}`);
    console.log(`${'Upload BW'.padEnd(AppConfig.GENERAL.LOG_PAD)}: ${AppUtility.toFixedDecimal(this.uploadBW)} KB/s`);
    console.log(`${'Download BW'.padEnd(AppConfig.GENERAL.LOG_PAD)}: ${AppUtility.toFixedDecimal(this.downloadBW)} KB/s`);
    console.log('Churn Probability');
    console.log(`${'  On-to-off'.padEnd(AppConfig.GENERAL.LOG_PAD)}: ${AppUtility.toFixedDecimal(this.churnProb.onToOff)}`);
    console.log(`${'  Off-to-on'.padEnd(AppConfig.GENERAL.LOG_PAD)}: ${AppUtility.toFixedDecimal(this.churnProb.offToOn)}`);
  }
  churn() {
    if ((this.isOnline && Math.random() <= this.churnProb.onToOff) ||
        (!this.isOnline && Math.random() <= this.churnProb.offToOn)) {
      this.isOnline = !this.isOnline;
    }
  }
  onReceiveMessage(sender, message) {
    console.log(colors.cyan(`${`${sender.name}`.padEnd(AppConfig.GENERAL.LOG_PAD_VERY_SHORT)} --> ${`${this.name}`.padEnd(AppConfig.GENERAL.LOG_PAD_VERY_SHORT)}: ${JSON.stringify(message)}`));
  }
}

export default Peer;
