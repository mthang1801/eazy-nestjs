import * as crypto from 'crypto';

export class Cryptography {
  private algorithm: string = 'aes-256-cbc';
  private key: Buffer = crypto.randomBytes(32);
  private iv: Buffer = crypto.randomBytes(16);
  private ivLength: number = 32;
  constructor() {}

  //Encrypting text
  public encrypt(text) {
    let cipher = crypto.createCipheriv(
      this.algorithm,
      Buffer.from(this.key),
      this.iv,
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    console.log(this.encodeBase64String(encrypted));
    return {
      iv: this.iv.toString('hex'),
      encryptedData: encrypted.toString('hex'),
    };
  }

  // Decrypting text
  public decrypt(text) {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(this.key),
      iv,
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  public encodeBase64String(str) {
    return Buffer.from(str, 'utf8').toString('base64');
  }

  decodeBase64String(buffer) {
    return Buffer.from(buffer, 'base64').toString('utf8');
  }
}
