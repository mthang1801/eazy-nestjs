import { formatStandardTimeStamp } from 'src/utils/helper';

export const datetimeFieldsList = [
  'created_at',
  'created_date',
  'updated_at',
  'updated_date',
  'display_at',
  'start_date',
  'end_date',
  'start_at',
  'end_at',
  'birthday',
  'imported_at',
  'last_comment',
  'payment_date',
];

const quotation = `"`;
const replaceQuotation = '_quot';
const apostrophe = `'`;
const replaceApostrophe = '_apos';

export const preprocessAddTextDataToMysql = (data: any) => {
  if (data == null) {
    return null;
  }
  if (data && typeof data == 'string') {
    return data
      .replace(new RegExp(quotation, 'g'), replaceQuotation)
      .replace(new RegExp(apostrophe, 'g'), replaceApostrophe)
      .trim();
  }
  return data;
};

export const processGetTextDataFromMysql = (data) => {
  if (data == null) {
    return null;
  }
  if (data && typeof data == 'string') {
    return data
      .replace(new RegExp(replaceQuotation, 'g'), quotation)
      .replace(new RegExp(replaceApostrophe, 'g'), apostrophe)
      .trim();
  }
  return data;
};

export const formatTypeValueToInSertSQL = (key, value) => {
  if (value === null) return `${key} = null`;

  if (
    (typeof value === 'string' && value.trim() === '') ||
    typeof value == 'undefined'
  )
    return `${key} = ''`;

  if (
    typeof value === 'object' &&
    value.operator &&
    ![null, undefined].includes(value.value)
  ) {
    return `${key} ${value.operator} '${value.value}' `;
  }

  if (
    typeof value == 'object' &&
    value.operator &&
    ![null, undefined].includes(value.value1) &&
    ![null, undefined].includes(value.value2)
  ) {
    return `${key} ${value.operator} '${value.value1}' AND '${value.value2}'`;
  }

  if (+value === 0) return `${key} = 0`;

  if (!isNaN(1 * +value) && value[0] == 0) {
    return `${key} = '${value}'`;
  }

  if (datetimeFieldsList.includes(key)) {
    return `${key} = '${formatStandardTimeStamp(new Date(value))}'`;
  }

  return `${key} = '${value}'`;
};

export const formatTypeValueConditionSQL = (value) => {
  if (value === null) return `null`;
  if (
    (typeof value === 'string' && value.trim() === '') ||
    typeof value == 'undefined'
  )
    return `''`;

  if (+value === 0) return `0`;

  if (!isNaN(1 * +value)) {
    if (value[0] == 0) {
      return `'${value}'`;
    }
  }

  return `'${value}'`;
};

export const preprocessDatabaseBeforeResponse = (data): object => {
  if (!data || (typeof data === 'object' && !Object.entries(data).length)) {
    return null;
  }

  let dataObject = { ...data };

  function* iterateObject(o) {
    var keys = Object.keys(o);
    for (var i = 0; i < keys.length; i++) {
      yield [keys[i], o[keys[i]]];
    }
  }

  for (let [key, val] of iterateObject(dataObject)) {
    if (val == null) {
      dataObject[key] = null;
      continue;
    }
    if (datetimeFieldsList.includes(key)) {
      dataObject[key] = formatStandardTimeStamp(new Date(val));
      continue;
    }
    dataObject[key] = processGetTextDataFromMysql(val);
  }

  return dataObject;
};

export const orderCmds: string[] = [
  'select',
  'from',
  'join',
  'where',
  'groupBy',
  'having',
  'skip',
  'limit',
  'orderBy',
];

export const exclusiveConditionsCmds: string[] = [
  'select',
  'from',
  'join',
  'groupBy',
  'orderBy',
];
