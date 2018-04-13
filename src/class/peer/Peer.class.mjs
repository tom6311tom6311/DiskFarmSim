import PD from 'probability-distributions';
import colors from 'colors';
import AppUtility from '../../utility/AppUtility.class.mjs';
import AppConfig from '../../constant/AppConfig.constant.mjs';

class Peer {
  constructor() {
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
  }
  printInfo() {
    console.log(colors.green('\n\n###   Peer Info   ###'));
    console.log(`${'Upload BW'.padEnd(AppConfig.GENERAL.LOG_PAD)}: ${AppUtility.toFixedDecimal(this.uploadBW)} KB/s`);
    console.log(`${'Download BW'.padEnd(AppConfig.GENERAL.LOG_PAD)}: ${AppUtility.toFixedDecimal(this.downloadBW)} KB/s`);
    console.log('Churn Probability');
    console.log(`${'  On-to-off'.padEnd(AppConfig.GENERAL.LOG_PAD)}: ${AppUtility.toFixedDecimal(this.churnProb.onToOff)}`);
    console.log(`${'  Off-to-on'.padEnd(AppConfig.GENERAL.LOG_PAD)}: ${AppUtility.toFixedDecimal(this.churnProb.offToOn)}`);
  }
}

export default Peer;
