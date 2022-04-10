import { Injectable, Inject, Logger } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { formatQueryString } from 'src/utils/helper';
import { DatabasePool } from './enums/databasePool.enum';
@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);
  constructor(
    @Inject(DatabasePool.WRITE_POOL) private writePool: Pool,
    @Inject(DatabasePool.READ_POOL) private readPool: Pool,
    @Inject(DatabasePool.MAGENTO_POOL) private magentoPool: Pool,
  ) {}

  async executeQueryWritePool(
    queryText: string,
    values: any[] = [],
  ): Promise<void> {
    let sqlQuery = formatQueryString(queryText);
    this.logger.verbose(`Executing mutation: ${sqlQuery}`);
    return new Promise(async (resolve, reject) => {
      this.writePool
        .query(sqlQuery, values)
        .then((result: any) => {
          resolve(result);
        })
        .catch((err) => reject(err));
    });
  }
  async executeQueryReadPool(
    queryText: string,
    values: any[] = [],
  ): Promise<void> {
    let sqlQuery = formatQueryString(queryText);
    this.logger.debug(`Executing query: ${sqlQuery}`);
    return new Promise(async (resolve, reject) => {
      this.readPool
        .query(sqlQuery, values)
        .then((result: any) => {
          resolve(result);
        })
        .catch((err) => reject(err));
    });
  }

  async executeMagentoPool(
    queryText: string,
    values: any[] = [],
  ): Promise<void> {
    let sqlQuery = formatQueryString(queryText);
    this.logger.verbose(`Executing mutation: ${sqlQuery}`);
    return new Promise(async (resolve, reject) => {
      this.magentoPool
        .query(sqlQuery, values)
        .then((result: any) => {
          resolve(result);
        })
        .catch((err) => reject(err));
    });
  }

  async startTransaction(): Promise<void> {
    let sql = 'START TRANSACTION;';
    await this.executeQueryWritePool(sql);
  }

  async commitTransaction(): Promise<void> {
    let sql = 'COMMIT;';
    await this.executeQueryWritePool(sql);
  }

  async rollbackTransaction(): Promise<void> {
    let sql = 'ROLLBACK;';
    await this.executeQueryWritePool(sql);
  }
}
