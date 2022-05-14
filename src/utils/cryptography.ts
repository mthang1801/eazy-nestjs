import { Console } from 'console';
import * as crypto from 'crypto';

export class Cryptography {
  private algorithm: string = 'aes-256-cbc';
  private key: Buffer = Buffer.from(process.env.SECURITY_KEY, 'hex');
  private iv: Buffer = Buffer.from(process.env.INIT_VECTOR, 'hex');
  constructor() {}

  //Encrypting text
  public encrypt(text) {
    let cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encryptedData = cipher.update(text, 'utf-8', 'hex');
    encryptedData += cipher.final('hex');
    const encodeEncryptedData = this.encodeBase64(encryptedData);
    return encodeEncryptedData;
  }

  // Decrypting text
  public decrypt(encryptedData: string) {
    const decodeEncryptedData = this.decodeBase64(encryptedData);
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
    let decryptedData = decipher.update(decodeEncryptedData, 'hex', 'utf-8');
    decryptedData += decipher.final('utf8');
    return decryptedData;
  }

  public encodeBase64(str) {
    return Buffer.from(str, 'utf8').toString('base64');
  }

  public decodeBase64(buffer) {
    return Buffer.from(buffer, 'base64').toString('utf8');
  }
}
