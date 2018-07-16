import hasha from 'hasha';
import AppConfig from '../constant/AppConfig.constant.mjs';

const CHAR_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateRandomContent() {
  let content = '';
  for (let i = 0; i < AppConfig.DATA_OWNER.FILE_CONTENT_LENGTH; i += 1) {
    content += CHAR_SET.charAt(Math.floor(Math.random() * CHAR_SET.length));
  }
  return content;
}

class FileGenerator {
  constructor() {
    this.generatedFiles = {};
  }
  generateFile() {
    const content = generateRandomContent();
    const hash = hasha(content, { encoding: 'binary', algorithm: 'sha256' }).substring(0, AppConfig.KADEMLIA.ID_LENGTH);
    this.generatedFiles[hash] = content;
    return { content, hash };
  }
}

export default new FileGenerator();
