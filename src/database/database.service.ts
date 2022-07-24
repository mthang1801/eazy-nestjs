import { Injectable, Inject, Logger } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { formatQueryString } from 'src/utils/helper';
import { DatabasePool } from './enums/databasePool.enum';
import { Table } from './enums/tables.enum';
import { AutoIncrementKeys } from './enums/autoIncrementKeys.enum';
import { ITracker } from './interfaces/trackers.interface';
import { datetimeFieldsList } from '../base/base.helper';
import { formatStandardTimeStamp, checkValidTimestamp } from '../utils/helper';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);
  private trackers: object[] = [];
  private isTracking: boolean = false;
  private dataTracker: ITracker = {};

  constructor(
    @Inject(DatabasePool.WRITE_POOL) private writePool: Pool,
    @Inject(DatabasePool.READ_POOL) private readPool: Pool,
  ) {}

  async executeQueryWritePool(
    queryText: string,
    values: any[] = [],
    showLog: boolean = true,
  ): Promise<void> {
    let sqlQuery = formatQueryString(queryText);
    if (showLog) {
      this.logger.verbose(`Executing mutation: ${sqlQuery}`);
    }
    this.dataTracker = {};
    if (this.isTracking) {
      const tableName = this.getTableName(sqlQuery);
      this.dataTracker = {
        tableName,
        method:
          queryText.indexOf('INSERT INTO') > -1
            ? 'INSERT'
            : queryText.indexOf('DELETE') > -1
            ? 'DELETE'
            : 'UPDATE',
      };

      if (['UPDATE', 'DELETE'].includes(this.dataTracker.method)) {
        let condition = sqlQuery
          .substring(sqlQuery.indexOf('WHERE'))
          .trim()
          .replace('WHERE', '');
        this.dataTracker.condition = condition;

        let oldDataRawQuery = `SELECT * FROM ${tableName} WHERE ${condition}`;
        const oldDataResponse = await this.readPool.query(oldDataRawQuery);

        let oldData: any = oldDataResponse[0][0];

        this.dataTracker.oldData = oldData;
      }
    }

    return new Promise(async (resolve, reject) => {
      this.writePool
        .query(sqlQuery, values)
        .then((result: any) => {
          if (this.dataTracker.method == 'insert' && this.isTracking) {
            this.dataTracker.condition = `${
              AutoIncrementKeys[this.dataTracker.tableName]
            } = '${result[0].insertId}'`;
          }

          this.trackers.push(this.dataTracker);
          resolve(result);
        })
        .catch((err) => reject(err));
    });
  }
  async executeQueryReadPool(
    queryText: string,
    values: any[] = [],
    showLog: boolean = true,
  ): Promise<void> {
    let sqlQuery = formatQueryString(queryText);
    if (showLog) {
      this.logger.debug(`Executing query: ${sqlQuery}`);
    }

    return new Promise(async (resolve, reject) => {
      this.readPool
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

  startTracking() {
    this.trackers = [];
    this.isTracking = true;
    this.dataTracker = {};
    console.log('Tracking Started');
  }

  commitTracking() {
    this.trackers = [];
    this.isTracking = false;
    this.dataTracker = {};
    console.log('Tracking Commited');
  }

  async rollback() {
    console.log(this.trackers);
    await Promise.all(
      this.trackers.map(async (tracker: ITracker) => {
        let rawStringQuery = '';
        let stringData = '';
        switch (tracker.method) {
          case 'INSERT':
            rawStringQuery = `DELETE FROM ${tracker.tableName} WHERE ${tracker.condition} `;
            break;
          case 'UPDATE':
            Object.entries(tracker.oldData).forEach(([key, val], i) => {
              if (i !== 0) {
                stringData += datetimeFieldsList.includes(key)
                  ? checkValidTimestamp(val)
                    ? `, ${key} = '${formatStandardTimeStamp(val)}'`
                    : null
                  : `, ${key} = '${val}'`;
              } else {
                stringData += datetimeFieldsList.includes(key)
                  ? checkValidTimestamp(val)
                    ? ` ${key} = '${formatStandardTimeStamp(val)}'`
                    : null
                  : ` ${key} = '${val}'`;
              }
            });
            rawStringQuery = `UPDATE ${tracker.tableName} SET ${stringData} WHERE ${tracker.condition}`;

            break;
          case 'DELETE':
            Object.entries(tracker.oldData).forEach(([key, val], i) => {
              if (i !== 0) {
                stringData += datetimeFieldsList.includes(key)
                  ? checkValidTimestamp(val)
                    ? `, ${key} = '${formatStandardTimeStamp(val)}'`
                    : null
                  : `, ${key} = '${val}'`;
              } else {
                stringData += datetimeFieldsList.includes(key)
                  ? checkValidTimestamp(val)
                    ? ` ${key} = '${formatStandardTimeStamp(val)}'`
                    : null
                  : ` ${key} = '${val}'`;
              }
            });
            rawStringQuery = `INSERT INTO ${tracker.tableName} SET ${stringData}`;
            break;
        }
        console.log(rawStringQuery);
        await this.writePool.query(rawStringQuery);
        return tracker;
      }),
    );
    console.log('Tracking Rollback');
  }

  getTableName(queryText) {
    let startInsert = 'INSERT INTO';
    let endInsert = 'SET';
    let insertStartIndex = queryText.indexOf(startInsert);
    let insertEndIndex = queryText.indexOf(endInsert);

    if (insertStartIndex === 0 && insertEndIndex > insertStartIndex) {
      let tableName = queryText
        .substring(insertStartIndex + startInsert.length, insertEndIndex)
        .trim();
      return tableName;
    }

    let startUpdate = 'UPDATE';
    let endUpdate = 'SET';
    let updateStartIndex = queryText.indexOf(startUpdate);
    let updateEndIndex = queryText.indexOf(endUpdate);
    if (updateStartIndex === 0) {
      let tableName = queryText
        .substring(updateStartIndex + startUpdate.length, updateEndIndex)
        .trim();
      return tableName;
    }

    let startDelete = 'DELETE FROM';
    let endDelete = 'WHERE';
    let deleteStartIndex = queryText.indexOf(startDelete);
    let deleteEndIndex = queryText.indexOf(endDelete);
    if (deleteStartIndex === 0) {
      let tableName = queryText
        .substring(deleteStartIndex + startDelete.length, deleteEndIndex)
        .trim();
      return tableName;
    }
  }

  get dataTrackers() {
    return this.trackers;
  }
}
