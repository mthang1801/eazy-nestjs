import { searchFilterTemplate } from './template.where';
import { Like } from '../../operators/operators';
import { Table } from 'src/database/enums';

export const districtSearchFilter = (search = '', filterConditions = {}) => {
  let arraySearch = [];

  if (search) {
    arraySearch = [{ [`${Table.CITIES}.district_name`]: Like(search) }];
  }

  return searchFilterTemplate(filterConditions, arraySearch);
};
