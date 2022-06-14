import { HttpException, Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { DatabaseCollection } from '../database/database.collection';
import { Table, AutoIncrementKeys } from '../database/enums/index';
import { HttpStatus } from '@nestjs/common';
import { preprocessDatabaseBeforeResponse } from './base.helper';

import {
  preprocessAddTextDataToMysql,
  formatTypeValueToInSertSQL,
} from './base.helper';
const orderCmds = [
  'select',
  'from',
  'join',
  'groupBy',
  'having',
  'where',
  'skip',
  'limit',
  'orderBy',
];
@Injectable()
export class BaseRepositorty<T> {
  private logger = new Logger(BaseRepositorty.name);
  private _tableProps: string[];

  constructor(
    protected readonly databaseService: DatabaseService,
    protected table: Table,
  ) {
    this.table = table;
  }

  dbCollection() {
    let collection = new DatabaseCollection(this.table);
    return collection;
  }

  set tableProps(tableProps) {
    this._tableProps = tableProps;
  }

  get tableProps() {
    return this._tableProps;
  }

  setData(data) {
    let dataObject = {};

    for (let [key, val] of Object.entries(data)) {
      if (this._tableProps.includes(key)) {
        dataObject[key] = typeof val === 'string' ? val.trim() : val;
      }
    }

    //Primiry keys is unique and db define

    // delete dataObject[AutoIncrementKeys[this.table]];

    return dataObject;
  }

  /**
   * Find one record by item
   * @param options
   * @returns
   */
  async findOne(options: any): Promise<any> {
    this.logger.log(
      `=============== [MYSQL] FIND ONE ON ${this.table} ================`,
    );

    if (typeof options !== 'object') {
      throw new HttpException(
        'Tham số đưa vào phải là Object',
        HttpStatus.BAD_REQUEST,
      );
    }
    let results;

    if (
      Object.keys(options).some(
        (val) =>
          val.toLowerCase() === 'where' || /(select|from|join)/gi.test(val),
      )
    ) {
      results = await this.find({ ...options, limit: 1 }, false);
    } else {
      results = await this.find({ where: options, limit: 1 }, false);
    }

    return preprocessDatabaseBeforeResponse(results[0]);
  }

  /**
   * Find items by multi filters
   * @param options
   * @returns array
   */
  async find(options: any = {}, showLog = true) {
    if (showLog) {
      this.logger.log(
        `=============== [MYSQL] FIND ON ${this.table} ================`,
      );
    }

    const optionKeys = Object.keys(options);
    const collection = new DatabaseCollection(this.table);

    if (
      !Object.keys(options).some(
        (val) =>
          val.toLowerCase() === 'where' || /(select|from|join)/gi.test(val),
      )
    ) {
      collection['where'](options);
    }

    for (let cmd of orderCmds) {
      if (optionKeys.includes(cmd)) {
        if (cmd === 'skip') {
          collection['setSkip'](options[cmd]);
          continue;
        }
        if (cmd === 'limit') {
          collection['setLimit'](options[cmd]);
          continue;
        }
        collection[cmd](options[cmd]);
      }
    }

    const res = await this.databaseService.executeQueryReadPool(
      collection.sql(),
    );
    let results: any[] = [];

    for (let result of res[0]) {
      results.push(preprocessDatabaseBeforeResponse(result));
    }
    return results;
  }

  async count(params, showLog: boolean = true): Promise<any> {
    if (showLog) {
      this.logger.log(
        `=============== [MYSQL] COUNT ON ${this.table} ================`,
      );
    }

    if (
      typeof params !== 'object' ||
      Object.keys(params).some(
        (value: string) =>
          orderCmds.includes(value.toLowerCase()) &&
          value.toLowerCase() !== 'where' &&
          value.toLowerCase() !== 'join',
      )
    ) {
      throw new HttpException(
        'Tham số truyền vào không hợp lệ.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const collection = new DatabaseCollection(this.table);
    let distinctParam: any = null;
    Object.entries(params).forEach(([key, val]) => {
      if (['join', 'where'].includes(key)) {
        collection[key](val);
      }
      if (key.toLowerCase() == 'distinct') {
        distinctParam = { [key]: val };
      }
    });

    const result = await this.databaseService.executeQueryReadPool(
      distinctParam
        ? collection.sqlCount(distinctParam)
        : collection.sqlCount(),
    );

    return result[0][0]['total'] || 0;
  }
  /**
   * Create new record
   * @param params
   * @returns
   */
  async create(
    inputData: any,
    returnable: boolean = true,
    showLog: boolean = true,
  ): Promise<any> {
    if (showLog) {
      this.logger.log(
        `=============== [MYSQL] CREATE ON ${this.table} ================`,
      );
    }

    if (Array.isArray(inputData) || typeof inputData !== 'object') {
      throw new HttpException(
        'Tham số truyền vào phải là một Object',
        HttpStatus.BAD_REQUEST,
      );
    }
    let fmtInputData: any = {};
    for (let [key, val] of Object.entries(inputData)) {
      if (typeof val === 'number') {
        fmtInputData[key] = preprocessAddTextDataToMysql(+val);
      } else {
        fmtInputData[key] = preprocessAddTextDataToMysql(val);
      }
    }

    let sql = `INSERT INTO ${this.table} SET `;

    Object.entries(fmtInputData).forEach(([key, val], i) => {
      if (i === 0) {
        sql += formatTypeValueToInSertSQL(key, val);
      } else {
        sql += `, ${formatTypeValueToInSertSQL(key, val)}`;
      }
    });

    let response = await this.databaseService.executeQueryWritePool(sql);

    if (returnable) {
      let lastInsertId = JSON.parse(JSON.stringify(response[0]))['insertId'];

      if (!lastInsertId) {
        throw new HttpException(
          'Không tìm thấy auto_increment_id của entity vừa tạo',
          404,
        );
      }

      return this.findOne({
        [`${this.table}.${[AutoIncrementKeys[this.table]]}`]: lastInsertId,
      });
    }
  }

  /**
   * Show one record by primary key id
   * @param id
   * @returns
   */
  async findById(id: number | any): Promise<T> {
    this.logger.log(
      `=============== [MYSQL] FIND BY ID ON ${this.table} ================`,
    );

    const stringQuery = `SELECT * FROM ${this.table} WHERE ?`;

    let rows;
    if (typeof id === 'object') {
      rows = await this.databaseService.executeQueryReadPool(stringQuery, [id]);
    } else {
      rows = await this.databaseService.executeQueryReadPool(stringQuery, [
        { [AutoIncrementKeys[this.table]]: id },
      ]);
    }

    const result = rows[0];

    return preprocessDatabaseBeforeResponse(result[0]);
  }

  /**
   * Update one record by primary key
   * @param id primary key
   * @param params object<any> with
   * @returns
   */
  async update(
    conditions: number | object,
    inputData: object,
    returnable: boolean = false,
    showLog = true,
  ) {
    if (showLog) {
      this.logger.warn(
        `=============== [MYSQL] UPDATE ON ${this.table} ================`,
      );
    }

    if (typeof inputData !== 'object') {
      throw new HttpException(
        'Tham số truyền vào không hợp lệ.',
        HttpStatus.BAD_REQUEST,
      );
    }

    let fmtParams: any = { ...inputData };

    for (let [key, val] of Object.entries(inputData)) {
      if (typeof val == 'number') {
        fmtParams[key] = preprocessAddTextDataToMysql(+val);
      } else {
        fmtParams[key] = preprocessAddTextDataToMysql(val);
      }
    }

    let sql = `UPDATE ${this.table} SET `;
    Object.entries(fmtParams).forEach(([key, val], i) => {
      if (i === 0) {
        sql += formatTypeValueToInSertSQL(key, val);
      } else {
        sql += `, ${formatTypeValueToInSertSQL(key, val)}`;
      }
    });

    sql += ' WHERE ';

    if (typeof conditions === 'object') {
      Object.entries(conditions).forEach(([key, val], i) => {
        if (i === 0) {
          sql += formatTypeValueToInSertSQL(key, val);
        } else {
          sql += ` AND ${formatTypeValueToInSertSQL(key, val)}`;
        }
      });
    } else {
      sql += ` ${AutoIncrementKeys[this.table]} = '${conditions}'`;
    }

    await this.databaseService.executeQueryWritePool(sql);

    if (returnable) {
      const updatedData =
        typeof conditions === 'object'
          ? await this.findOne(conditions)
          : await this.findById(conditions);

      return updatedData;
    }
  }

  async delete(
    conditions: number | object,
    returnable: boolean = false,
    showLog: boolean = true,
  ) {
    if (showLog) {
      this.logger.error(
        `=============== [MYSQL] DELETE ON ${this.table} ================`,
      );
    }

    let queryString = `DELETE FROM ${this.table} WHERE `;

    let res;
    if (typeof conditions === 'object') {
      if (Array.isArray(conditions)) {
        for (let i = 0; i < conditions.length; i++) {
          if (typeof conditions[i] !== 'object') {
            throw new HttpException(
              'Sai cú pháp truy vấn',
              HttpStatus.BAD_REQUEST,
            );
          }
          Object.entries(conditions).forEach(([key, val], i) => {
            if (i === 0) {
              queryString += `${key} = '${val}'`;
            } else {
              queryString += ` OR ${key} = '${val}'`;
            }
          });
        }
      } else {
        Object.entries(conditions).forEach(([key, val], i) => {
          if (i === 0) {
            queryString += `${key} = '${val}'`;
          } else {
            queryString += ` AND ${key} = '${val}'`;
          }
        });
      }
      res = await this.databaseService.executeQueryWritePool(queryString, [
        conditions,
      ]);
    } else {
      queryString += ` ? `;
      res = await this.databaseService.executeQueryWritePool(queryString, [
        { [AutoIncrementKeys[this.table]]: conditions },
      ]);
    }

    if (res[0].affectedRows === 0) {
      return false;
    }

    if (returnable) {
      const deletedData =
        typeof conditions === 'object'
          ? await this.findOne(conditions)
          : await this.findById(conditions);

      return deletedData;
    }

    return true;
  }

  async readExec(queryString: string): Promise<any> {
    return this.databaseService.executeQueryReadPool(queryString);
  }

  async writeExec(queryString: string, params: any = null): Promise<any> {
    return this.databaseService.executeQueryWritePool(queryString, params);
  }

  async startTransaction() {
    await this.databaseService.startTransaction();
  }

  async commitTransaction() {
    await this.databaseService.commitTransaction();
  }

  async rollbackTransaction() {
    await this.databaseService.rollbackTransaction();
  }
}
