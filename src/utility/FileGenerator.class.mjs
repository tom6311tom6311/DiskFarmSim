import hasha from 'hasha';
import randomstring from 'randomstring';
import AppConfig from '../constant/AppConfig.constant.mjs';

class FileGenerator {
  static generateFile(size) {
    const content = randomstring.generate({
      length: size,
      charset: 'alphabetic',
    });
    const binHash = parseInt(hasha(content, { algorithm: 'sha256' }), 16).toString(2).padStart(256, '0').substring(0, AppConfig.KADEMLIA.ID_LENGTH);
    return { content, binHash };
  }
}

export default FileGenerator;
