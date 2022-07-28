export const searchFilterTemplate = (
  fieldsSearch = [],
  filterConditions = {},
) => {
  if (!fieldsSearch.length && !Object.entries(filterConditions).length)
    return filterConditions;
  if (!fieldsSearch.length && Object.entries(filterConditions).length) {
    return filterConditions;
  }
  if (fieldsSearch.length && !Object.entries(filterConditions).length) {
    return fieldsSearch.map((searchItem) => ({ ...searchItem }));
  }
  let result = [];

  for (let fieldSearchItem of fieldsSearch) {
    result = [
      ...result,
      {
        ...filterConditions,
        ...fieldSearchItem,
      },
    ];
  }

  return result;
};
