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
    let encryptedData = `${this.iv.toString('hex')}-${encrypted.toString(
      'hex',
    )}`;
    let encodeBase64 = `${this.encodeBase64String(encryptedData)}+=${this.key}`;
    return encodeBase64;
  }

  // Decrypting text
  public decrypt(buffer: string) {
    let _decrypted: any = buffer.split('+=');
    _decrypted = _decrypted[0];
    let key = _decrypted[1];

    let textArr = _decrypted.split('-');
    console.log(textArr);
    let _iv = textArr[0];
    let encryptedData = textArr[1];
    let iv = Buffer.from(_iv, 'hex');
    let encryptedText = Buffer.from(encryptedData, 'hex');

    let decipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(key),
      iv,
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  public encodeBase64String(str) {
    return Buffer.from(str, 'utf8').toString('base64');
  }

  public decodeBase64String(buffer) {
    return Buffer.from(buffer, 'base64').toString('utf8');
  }
}
