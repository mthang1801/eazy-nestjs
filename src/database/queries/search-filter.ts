import { searchFilterTemplate } from '../../base/base.template';
import { Table } from '../enums';
export const searchFilterErrorLogs = (search = '', filterConditions = {}) => {
  let arraySearch = [];

  return searchFilterTemplate(arraySearch, filterConditions);
};
