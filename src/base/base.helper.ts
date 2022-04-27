import { formatStandardTimeStamp } from 'src/utils/helper';

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

  if (
    [
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
    ].includes(key)
  ) {
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
