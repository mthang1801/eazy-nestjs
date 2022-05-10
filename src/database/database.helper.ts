export const formatStringCondition = (position, existsItem) => {
  let formatStringCond =
    position == 0
      ? `WHERE ${existsItem['field']} ${existsItem['operation']} ${existsItem['value']} `
      : ` ${existsItem['connect']} ${existsItem['field']} ${existsItem['operation']} ${existsItem['value']} `;

  formatStringCond = formatStringCond.replace(/'\(/g, '(').replace(/\)'/g, ')');

  return formatStringCond;
};

export const formatHavingCondition = (position, existsItem) => {
  let formatStringCond =
    position == 0
      ? `HAVING ${existsItem['field']} ${existsItem['operation']} ${existsItem['value']} `
      : ` ${existsItem['connect']} ${existsItem['field']} ${existsItem['operation']} ${existsItem['value']} `;

  formatStringCond = formatStringCond.replace(/'\(/g, '(').replace(/\)'/g, ')');

  return formatStringCond;
};
