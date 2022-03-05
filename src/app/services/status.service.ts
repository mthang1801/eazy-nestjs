import { Injectable } from '@nestjs/common';
import { Table } from 'src/database/enums';
import { StatusEntity } from '../entities/status.entity';
import { StatusDataEntity } from '../entities/statusData.entity';
import { StatusDescriptionEntity } from '../entities/statusDescription';
import { StatusRepository } from '../repositories/status.repository';
import { StatusDataRepository } from '../repositories/statusData.repository';
import { StatusDescriptionRepository } from '../repositories/statusDescription.repository';
import { JoinTable } from '../../database/enums/joinTable.enum';
import { searchStatusFilter } from 'src/utils/tableConditioner';

@Injectable()
export class StatusService {
  constructor(
    private statusRepo: StatusRepository<StatusEntity>,
    private statusDescRepo: StatusDescriptionRepository<StatusDescriptionEntity>,
    private statusDataRepo: StatusDataRepository<StatusDataEntity>,
  ) {}
  async getList(params) {
    let { page, limit, search, ...others } = params;
    page = +page || 1;
    limit = +limit || 10;
    let skip = (page - 1) * limit;

    let filterConditions = {};
    if (Object.entries(others).length) {
      for (let [key, val] of Object.entries(others)) {
        if (this.statusRepo.tableProps.includes(key)) {
          filterConditions[`${Table.STATUS}.${key}`] = val;
        }
      }
    }

    const statusesList = await this.statusRepo.find({
      select: '*',
      join: {
        [JoinTable.leftJoin]: {
          [Table.STATUS_DESCRIPTION]: {
            fieldJoin: `${Table.STATUS_DESCRIPTION}.status_id`,
            rootJoin: `${Table.STATUS}.status_id`,
          },
        },
      },
      where: searchStatusFilter(search, filterConditions),
      skip,
      limit,
    });

    let count = await this.statusRepo.find({
      select: `COUNT(DISTINCT(${Table.STATUS}.status_id)) as total`,
      join: {
        [JoinTable.leftJoin]: {
          [Table.STATUS_DESCRIPTION]: {
            fieldJoin: `${Table.STATUS_DESCRIPTION}.status_id`,
            rootJoin: `${Table.STATUS}.status_id`,
          },
        },
      },
      where: searchStatusFilter(search, filterConditions),
    });

    return {
      result: statusesList,
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count.length ? count[0].total : statusesList.length,
      },
    };
  }
}
