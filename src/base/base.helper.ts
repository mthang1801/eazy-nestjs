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
      .replace(new RegExp(apostrophe, 'g'), replaceApostrophe);
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
      .replace(new RegExp(replaceApostrophe, 'g'), apostrophe);
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

  if (typeof value === 'object' && value.operator && value.value) {
    return `${key} ${value.operator} '${value.value}' `;
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

export const preprocessDatabaseBeforeResponse = (data) => {
  if (!data || (typeof data === 'object' && !Object.entries(data).length)) {
    return null;
  }

  let dataObject = { ...data };

  function* iterate_object(o) {
    var keys = Object.keys(o);
    for (var i = 0; i < keys.length; i++) {
      yield [keys[i], o[keys[i]]];
    }
  }

  for (let [key, val] of iterate_object(dataObject)) {
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
