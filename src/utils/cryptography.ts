import { Console } from 'console';
import * as crypto from 'crypto';

export class Cryptography {
  private algorithm: string = 'aes-256-cbc';
  private key: Buffer = Buffer.from(process.env.SECURITY_KEY, 'hex');
  private iv: Buffer = Buffer.from(process.env.INIT_VECTOR, 'hex');
  private secretKey = process.env.ENCRYPT_KEY;
  // private initVector = Buffer.from(16);
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

  public generateSHA512(str, secretKey) {
    if (secretKey) {
      return crypto.createHmac('sha256', secretKey).update(str).digest('hex');
    }
    return crypto.createHash('sha512').update(str).digest('hex');
  }

  public uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }

  // public encrypt_token(data) {
  //   var encipher = crypto.createCipheriv(
  //       this.algorithm,
  //       this.secretKey,
  //       this.initVector,
  //     ),
  //     buffer = Buffer.concat([encipher.update(data), encipher.final()]);
  //   return buffer.toString('base64');
  // }

  // public decrypt_token(data) {
  //   var decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv),
  //     buffer = Buffer.concat([
  //       decipher.update(Buffer.from(data, 'base64')),
  //       decipher.final(),
  //     ]);
  //   return buffer.toString();
  // }

  public encodeBase64(str) {
    return Buffer.from(str, 'utf8').toString('base64');
  }

  public decodeBase64(buffer) {
    return Buffer.from(buffer, 'base64').toString('utf8');
  }
}
