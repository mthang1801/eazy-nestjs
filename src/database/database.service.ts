import { Injectable, Inject, Logger } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { DatabasePool } from './enums/databasePool.enum';
@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);
  constructor(
    @Inject(DatabasePool.WRITE_POOL) private writePool: Pool,
    @Inject(DatabasePool.READ_POOL) private readPool: Pool,
  ) {}

  async executeQueryWritePool(
    queryText: string,
    values: any[] = [],
  ): Promise<void> {
    this.logger.debug(
      `Executing mutation: ${queryText.replace(/''/g, '')} (${values})`,
    );
    return new Promise(async (resolve, reject) => {
      this.writePool
        .query(queryText.replace(/''/g, ''), values)
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
    this.logger.debug(
      `Executing query: ${queryText.replace(/''/g, '')} (${values})`,
    );
    return new Promise(async (resolve, reject) => {
      this.readPool
        .query(queryText.replace(/''/g, ''), values)
        .then((result: any) => {
          resolve(result);
        })
        .catch((err) => reject(err));
    });
  }
}
