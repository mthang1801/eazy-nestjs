/*
 * Copyright (c) Nhat Tin Logistics 2019. All Rights Reserved.
 * @author khoa.nt
 */

import * as crypto from 'crypto';
import generator from 'generate-password';

export function genRandomString(length): string {
  return crypto
    .randomBytes(Math.ceil(+length / 2))
    .toString('hex')
    .slice(0, length);
}

export function sha512(password, salt) {
  const hash = crypto.createHmac('sha512', getStringValue(salt));
  hash.update(getStringValue(password));
  const passwordHash = hash.digest('hex');

  return {
    salt,
    passwordHash,
  };
}

export function getStringValue(data) {
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

export function saltHashPassword(password) {
  const salt = genRandomString(10);
  return sha512(getStringValue(password), salt);
}

export function desaltHashPassword(password, salt) {
  const hash = crypto.createHmac('sha512', getStringValue(salt));
  hash.update(getStringValue(password));

  return hash.digest('hex');
}

export function generateSHA512(str) {
  return crypto.createHash('sha512').update(str).digest('hex');
}

export function generateMD5(str) {
  const hash = crypto.createHash('md5').update(str).digest('hex');
  return hash;
}

export function genPassword() {
  var password = generator.generate({
    length: 10,
    numbers: true,
  });
  return password;
}

export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function endcodeBase64String(str) {}
