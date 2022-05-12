import { v4 as uuid } from 'uuid';
import * as moment from 'moment';

import * as crypto from 'crypto';

export function genRandomString(length: number): string {
  return crypto
    .randomBytes(Math.ceil(+length / 2))
    .toString('hex')
    .slice(0, length);
}

export const preprocessUserResult = (user) => {
  if (!user) return null;
  if (typeof user == 'object' && Array.isArray(user)) {
    let users = [];
    user.forEach((item) => {
      let userObject = { ...item };
      // delete userObject.password;
      delete userObject.salt;
      users.push(userObject);
    });
    return users;
  }
  let userObject = { ...user };
  delete userObject.password;
  delete userObject.salt;
  return userObject;
};

export const generateOTPDigits = () =>
  Math.floor(100000 + Math.random() * 900000);

export const generateRandomNumber = (length) => {
  let result = '';
  if (length < 0) {
    return result;
  }
  for (let i = 0; i < length; i++) {
    let value = Math.random() * 10;

    if (value < 1) {
      value = 0;
    } else if (value > 9) {
      value = 9;
    } else {
      value = Math.ceil(value);
    }
    result += value.toString();
  }
  return result;
};

export const generateRandomString = () => uuid().replace(/-/g, '');

export const generateRandomPassword = (length = 10) => {
  let password = '';
  let charset =
    'abcdefghijklmnopqrstuvwxyz!@#$%^&ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

export const convertToSlug = (text, genTailRandomString = false) => {
  let slug = removeVietnameseTones(text);

  if (genTailRandomString) {
    slug = `${slug}-${genRandomString(6)}`;
  }

  return slug
    .toLowerCase()
    .trim()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

export const removeVietnameseTones = (str) => {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
  str = str.replace(/Đ/g, 'D');
  // Some system encode vietnamese combining accent as individual utf-8 characters
  // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ''); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
  // Remove extra spaces
  // Bỏ các khoảng trắng liền nhau
  str = str.replace(/ + /g, ' ');
  str = str.trim();
  // Remove punctuations
  // Bỏ dấu câu, kí tự đặc biệt
  str = str.replace(
    /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    ' ',
  );
  return str.toLowerCase();
};

export const formatQueryString = (queryString: string) => {
  let result = queryString;
  if (/'NULL'/i.test(queryString)) {
    result = result.replace(/'NULL'/gi, 'NULL');
  }

  return result;
};

export const convertNullData = (data) => (data ? data : null);

export const convertNullDatetimeData = (data) =>
  data ? formatStandardTimeStamp(new Date(data)) : null;

export const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
};

export const hasWhiteSpace = (s) => s.indexOf(' ') >= 0;

export const formatStandardTimeStamp = (
  timestamp: string | Date = new Date(),
) => moment(timestamp).format('YYYY-MM-DD HH:mm:ss');

export const formatDateTime = (timestamp: string | Date = new Date()) =>
  moment(timestamp).format('YYYY-MM-DD');

export const formatTime = (timestamp: string | Date = new Date()) =>
  moment(timestamp).format('HH:mm:ss');

export const checkValidTimestamp = (timestamp) => moment(timestamp).isValid();

export const formatCustomerDatetime = (customer) => {
  customer['created_at'] = customer['created_at']
    ? formatStandardTimeStamp(customer['created_at'])
    : customer['created_at'];
  customer['updated_at'] = customer['updated_at']
    ? formatStandardTimeStamp(customer['updated_at'])
    : customer['updated_at'];
  customer['birthday'] = customer['birthday']
    ? formatStandardTimeStamp(customer['birthday'])
    : customer['birthday'];
  return customer;
};

export const getPageSkipLimit = (params) => {
  let { page, limit } = params;
  page = +page || 1;
  limit = +limit || 10;
  let skip = (page - 1) * limit;
  return { page, skip, limit };
};

export const isNumeric = (value: string | number) => {
  if (typeof value == 'undefined' || !value) {
    return false;
  }
  let fmtValue: any = value;
  if (typeof fmtValue == 'string') {
    fmtValue = fmtValue.trim();
    if (fmtValue == '') {
      return false;
    }
  }
  return !isNaN(1 * fmtValue);
};

export const startToday = moment(new Date().toLocaleDateString()).format(
  'YYYY-MM-DD HH:mm:ss',
);

function distance(lat1, lon1, lat2, lon2, unit) {
  var radlat1 = (Math.PI * lat1) / 180;
  var radlat2 = (Math.PI * lat2) / 180;
  var theta = lon1 - lon2;
  var radtheta = (Math.PI * theta) / 180;
  var dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  if (unit == 'K') {
    dist = dist * 1.609344;
  }
  if (unit == 'N') {
    dist = dist * 0.8684;
  }
  return dist;
}

export const checkRestrictedCommentsListIntoRegularExpress = (str) =>
  str
    .split(',')
    .map((item) => `(${item})`)
    .join('|');

export const removeMoreThanOneSpace = (str) => str.replace(/\s\s+/g, ' ');
