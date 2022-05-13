import { Injectable, HttpException } from '@nestjs/common';
import { LogEntity } from '../entities/logs.entity';
import { LogRepository } from '../repositories/log.repository';
import { getPageSkipLimit } from '../../utils/helper';
import { LogModuleRepository } from '../repositories/logModule.repository';
import { LogModuleEntity } from '../entities/logModule.entity';
import { logJoiner } from '../../utils/joinTable';
import { Table } from 'src/database/enums';
import { logSearchFilter } from '../../utils/tableConditioner';

@Injectable()
export class LogsService {
  constructor(
    private logRepo: LogRepository<LogEntity>,
    private logModuleRepo: LogModuleRepository<LogModuleEntity>,
  ) {}
  async create(data) {
    const logData = { ...new LogEntity(), ...this.logRepo.setData(data) };
    await this.logRepo.create(logData);
  }

  async get(log_id) {
    const result = await this.logRepo.findOne({
      select: '*',
      join: logJoiner,
      where: { [`${Table.LOG}.log_id`]: log_id },
    });

    if (result) {
      throw new HttpException('Không tìm thấy log', 404);
    }
    return result;
  }

  async getList(params) {
    let { page, skip, limit } = getPageSkipLimit(params);
    let { search, status, module_id, source_id } = params;
    let filterConditions = {};
    if (status) {
      filterConditions[`${Table.LOG}.status`] = status;
    }

    if (module_id) {
      filterConditions[`${Table.LOG}.module_id`] = module_id;
    }

    if (source_id) {
      filterConditions[`${Table.LOG}.source_id`] = source_id;
    }

    let result = await this.logRepo.find({
      select: '*',
      join: logJoiner,
      where: logSearchFilter(search, filterConditions),
      skip,
      limit,
    });

    let count = await this.logRepo.find({
      select: `COUNT(${Table.LOG}.log_id) as total`,
      join: logJoiner,
      where: logSearchFilter(search, filterConditions),
    });

    return {
      paging: {
        pageSize: limit,
        currentPage: page,
        total: count[0].total,
      },
      logs: result,
    };
  }
}
