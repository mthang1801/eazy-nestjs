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

export const getPageSkipLimit = (params) => {
  let { page, limit } = params;

  page = +page || 1;
  limit = +limit || 50;
  if (limit > 100) {
    limit = 100;
  }
  let skip = (page - 1) * limit;
  return { page, skip, limit };
};
