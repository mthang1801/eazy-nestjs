import { searchFilterTemplate } from './template.where';
import { Like } from '../../operators/operators';
import { Table } from 'src/database/enums';

export const wardSearchFilter = (search = '', filterConditions = {}) => {
  let arraySearch = [];

  if (search) {
    arraySearch = [{ [`${Table.WARDS}.ward_name`]: Like(search) }];
  }

  return searchFilterTemplate(filterConditions, arraySearch);
};
