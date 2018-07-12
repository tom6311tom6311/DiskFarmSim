import promptly from 'promptly';
import mkdirp from 'mkdirp';
import AppConfig from './src/constant/AppConfig.constant.mjs';
import CommandManager from './src/utility/CommandManager.class.mjs';
import PeerManager from './src/utility/PeerManager.class.mjs';

console.log('\n\nWelcome to DiskFarm ~');
console.log('Simulation Started.');

mkdirp(AppConfig.GENERAL.LOG_DIR, (err) => {
  if (err) throw err;
});

PeerManager.initPeers(
  AppConfig.DATA_OWNER.TOTAL_NUM,
  AppConfig.SHARD_KEEPER.TOTAL_NUM,
  AppConfig.FARMER.TOTAL_NUM,
);

(async () => {
  for (;;) {
    try {
      const command = await promptly.prompt('> '); // eslint-disable-line no-await-in-loop
      CommandManager.parse(command);
    } catch (error) {
      console.log(error);
      process.exit();
    }
  }
})();

