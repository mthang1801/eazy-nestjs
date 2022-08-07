import { Injectable, Logger, Scope } from '@nestjs/common';
import { IErrorLog } from 'src/interfaces/errorLog.interface';
import { ErrorLogRepository } from '../repositories/errorLog.repository';
import { ErrorLogEntity } from '../entities/errorLog.entity';
import { findSourceRaiseError } from './log.helper';
import { getPageSkipLimit, isJsonString } from '../utils/helper';
import { searchFilterErrorLogs } from 'src/database/queries/search-filter';
import { Table } from 'src/database/enums';

@Injectable({ scope: Scope.TRANSIENT })
export class LogService extends Logger {
  constructor(private errorLogRepo: ErrorLogRepository) {
    super();
  }
  error(message: string, trace?: string, context?: string): void {
    // TO DO
    super.error(message, trace, context);
  }

  warn(message: string, context?: string): void {
    // TO DO
    super.warn(message, context);
  }

  log(message: string, context?: string): void {
    // TO DO
    super.log(message, context);
  }

  debug(message: string, context?: string): void {
    // TO DO
    super.debug(message, context);
  }

  verbose(message: string, context?: string): void {
    // TO DO
    super.verbose(message, context);
  }

  async insertErrorLog(logData: IErrorLog) {
    let errorLogData = {
      ...new ErrorLogEntity(),
      ...this.errorLogRepo.setData(logData),
      source: findSourceRaiseError(JSON.parse(logData.headers)?.origin),
    };

    await this.errorLogRepo.createOne(errorLogData);
    return;
  }

  async getListErrorLogs(params) {
    let { search } = params;
    let { page, skip, limit } = getPageSkipLimit(params);
    let filterConditions = {};
    let _errorsLists: Promise<IErrorLog[]> = this.errorLogRepo.findMany({
      select: '*',
      where: searchFilterErrorLogs(search, filterConditions),
      orderBy: [{ field: `${Table.ERROR_LOG}.created_at`, sortBy: 'DESC' }],
      skip,
      limit,
    });
    let _count = this.errorLogRepo.findMany({
      select: `COUNT(*) as total`,
      where: searchFilterErrorLogs(search, filterConditions),
    });

    let [errorsLists, count] = await Promise.all([_errorsLists, _count]);
    let errorsListsResult: any = errorsLists.map((errorItem) => ({
      ...errorItem,
      headers: JSON.parse(errorItem.headers),
      params: isJsonString(errorItem.params)
        ? JSON.parse(errorItem.params)
        : errorItem.params,
      query: isJsonString(errorItem.query)
        ? JSON.parse(errorItem.query)
        : errorItem.query,
      body: isJsonString(errorItem.body)
        ? JSON.parse(errorItem.body)
        : errorItem.body,
      error_details: isJsonString(errorItem.error_details)
        ? JSON.parse(errorItem.error_details).map((errorDetail) =>
            errorDetail.replace(/_dashdash/g, '/'),
          )
        : errorItem.error_details,
    }));

    return {
      paging: { currentPage: page, pageSize: limit, total: count[0].total },
      data: errorsListsResult,
    };
  }
}
