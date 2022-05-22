import * as crypto from 'crypto';

export class Cryptography {
  private algorithm: string = 'aes-256-cbc';
  private secretKey = Buffer.from(process.env.SECURITY_KEY, 'hex');
  private ivKey = crypto.randomBytes(16).fill(0);
  constructor() {}

  //Encrypting text
  public encrypt(text) {
    let cipher = crypto.createCipheriv(
      this.algorithm,
      this.secretKey,
      this.ivKey,
    );
    let buffer = Buffer.concat([cipher.update(text), cipher.final()]);
    return this.encodeBase64(buffer);
  }

  // Decrypting text
  public decrypt(encryptedData: string) {
    let decipher = crypto.createDecipheriv(
      this.algorithm,
      this.secretKey,
      this.ivKey,
    );
    let buffer = Buffer.concat([
      decipher.update(Buffer.from(encryptedData, 'base64')),
      decipher.final(),
    ]);
    return buffer.toString();
  }

  public generateSHA512(str, secretKey) {
    if (secretKey) {
      return crypto.createHmac('sha256', secretKey).update(str).digest('hex');
    }
    return crypto.createHash('sha512').update(str).digest('hex');
  }

  public uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }

  public genRandomString(length): string {
    return crypto
      .randomBytes(Math.ceil(+length / 2))
      .toString('hex')
      .slice(0, length);
  }

  public encodeBase64(str) {
    return Buffer.from(str, 'utf8').toString('base64');
  }

  public decodeBase64(buffer) {
    return Buffer.from(buffer, 'base64').toString('utf8');
  }

  private getStringValue(data) {
    if (typeof data === 'number' || data instanceof Number) {
      return data.toString();
    }
    if (!Buffer.isBuffer(data) && typeof data !== 'string') {
      throw new TypeError(
        'Data for password or salt must be a string or a buffer',
      );
    }

    return data;
  }

  public saltHashPassword(password) {
    const salt = this.genRandomString(10);
    return this.sha512(this.getStringValue(password), salt);
  }

  public desaltHashPassword(password, salt) {
    const hash = crypto.createHmac('sha512', this.getStringValue(salt));
    hash.update(this.getStringValue(password));

    return hash.digest('hex');
  }

  public sha512(str, secretKey) {
    const hash = crypto.createHmac('sha512', this.getStringValue(secretKey));
    hash.update(this.getStringValue(str));
    const hashedData = hash.digest('hex');

    return {
      secretKey,
      hashedData,
    };
  }

  public generateMD5(str) {
    const hash = crypto.createHash('md5').update(str).digest('hex');
    return hash;
  }
}
