import { searchFilterTemplate } from './template.where';
import { Like } from '../../operators/operators';
import { Table } from 'src/database/enums';

export const userLoyaltyHistorySearchFilter = (
  search = '',
  filterConditions = {},
) => {
  let arraySearch = [];

  return searchFilterTemplate(filterConditions, arraySearch);
};
