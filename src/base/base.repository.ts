import { HttpException, Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { BaseConfigure } from './base.configure';
import { Table, AutoIncrementKeys } from '../database/enums/index';
import { HttpStatus } from '@nestjs/common';
import { formatTypeValueConditionSQL } from './base.helper';
import {
  SHOW_LOG_ON_CREATE_ONE,
  SHOW_LOG_ON_FIND_MANY,
  SHOW_LOG_ON_FIND_ONE,
  SHOW_LOG_ON_FIND_ONE_AND_CREATE,
} from '../constants/index.constant';
import {
  preprocessDatabaseBeforeResponse,
  orderCmds,
  exclusiveConditionsCmds,
} from './base.helper';

import {
  preprocessAddTextDataToMysql,
  formatTypeValueToInSertSQL,
} from './base.helper';
import databaseConfig from 'src/config/database.config';
import { formatRawStringCondition } from '../database/database.helper';

@Injectable()
export class BaseRepositorty {
  private _logger = new Logger(BaseRepositorty.name);
  private _tableProps: string[];
  private _defaultValues: any;
  private _table: Table;
  constructor(protected readonly databaseService: DatabaseService) {}

  set table(tableName) {
    this._table = tableName;
  }

  get table() {
    return this._table;
  }

  dbCollection() {
    let collection = new BaseConfigure(this.table);
    return collection;
  }

  set defaultValues(values) {
    this._defaultValues = values;
  }

  get defaultValues() {
    return this._defaultValues;
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

    delete dataObject[AutoIncrementKeys[this.table]];

    return dataObject;
  }

  /**
   * Find one record by item
   * @param options {any}
   * @param showLog {boolean}
   * @returns a record if condition is met else null
   */
  async findOne(
    options: any,
    showLog: boolean = SHOW_LOG_ON_FIND_ONE,
  ): Promise<any> {
    this._logger.log(
      `=============== [MYSQL] FIND ONE ON ${this.table} ================`,
    );

    if (typeof options !== 'object') {
      throw new HttpException(
        'Tham s??? ????a v??o ph???i l?? Object',
        HttpStatus.BAD_REQUEST,
      );
    }
    let results;

    if (
      Object.keys(options).some(
        (val) =>
          val.toLowerCase() === 'where' ||
          /(exclusiveConditionsCmds.join("|"))/gi.test(val),
      )
    ) {
      results = await this.findMany({ ...options, limit: 1 }, false);
    } else {
      results = await this.findMany({ where: options, limit: 1 }, false);
    }

    return preprocessDatabaseBeforeResponse(results[0]);
  }

  /**
   * Find items by multi filters
   * @param options
   * @returns many records if condition is met else empty array
   */
  async findMany(options: any = {}, showLog = true) {
    if (showLog) {
      this._logger.log(
        `=============== [MYSQL] FIND ON ${this.table} ================`,
      );
    }

    const optionKeys = Object.keys(options);
    const collection = new BaseConfigure(this.table);

    if (
      !Object.keys(options).some(
        (val) =>
          val.toLowerCase() === 'where' ||
          /(exclusiveConditionsCmds.join("|"))/gi.test(val),
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

  /**
   * Create a record without checking any conditions
   * If returnFullRecord is true will return full record else return last inserted id
   * @param inputData {any} required
   * @param returnFullRecord {boolean} default false
   * @param showLog {boolean} default false
   * @returns
   */
  async createOne(
    inputData: any,
    returnFullRecord: boolean = false,
    showLog: boolean = SHOW_LOG_ON_CREATE_ONE,
  ): Promise<any> {
    try {
      if (showLog) {
        this._logger.log(
          `=============== [MYSQL] CREATE ON ${this.table} ================`,
        );
      }

      if (Array.isArray(inputData) || typeof inputData !== 'object') {
        throw new HttpException(
          'Tham s??? truy???n v??o ph???i l?? m???t Object',
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
      let lastInsertId = JSON.parse(JSON.stringify(response[0]))['insertId'];
      if (returnFullRecord) {
        if (!lastInsertId) {
          throw new HttpException(
            'Kh??ng t??m th???y auto_increment_id c???a entity v???a t???o',
            404,
          );
        }

        return this.findOneInWritePool({
          [`${this.table}.${[AutoIncrementKeys[this.table]]}`]: lastInsertId,
        });
      }

      return {
        [AutoIncrementKeys[this.table]]: lastInsertId,
      };
    } catch (err) {
      throw new HttpException(err.response, err.status);
    }
  }

  /**
   * Create many records with data input is array
   * @param dataInput {any[]}
   * @param showLog {boolean}
   */
  async createMany(dataInput: any[], showLog: boolean = SHOW_LOG_ON_FIND_MANY) {
    try {
      if (showLog) {
        this._logger.log(
          `=============== [MYSQL] CREATE MANY ON ${this.table} ================`,
        );
      }
      let props = this._tableProps.filter(
        (fieldItem) => fieldItem != AutoIncrementKeys[this.table],
      );

      let queryResult = `INSERT INTO ${this.table} (${props.join(
        ', ',
      )}) VALUES `;

      if (dataInput.length) {
        for (let [i, dataInputItem] of dataInput.entries()) {
          let dataResult = '';

          for (let [j, keyProp] of props.entries()) {
            if (dataInputItem[keyProp]) {
              let val = dataInputItem[keyProp];

              if (typeof val === 'number') {
                dataResult += formatTypeValueConditionSQL(
                  preprocessAddTextDataToMysql(+val),
                );
              } else {
                dataResult += formatTypeValueConditionSQL(
                  preprocessAddTextDataToMysql(val),
                );
              }
            } else {
              dataResult += formatTypeValueConditionSQL(
                this.defaultValues[keyProp],
              );
            }

            if (j < props.length - 1) {
              dataResult += ', ';
            }
          }

          if (i < dataInput.length - 1) {
            dataResult = `( ${dataResult} ), `;
          } else {
            dataResult = `( ${dataResult} )`;
          }

          queryResult += dataResult;
        }
      }
      let response = await this.databaseService.executeQueryWritePool(
        queryResult,
      );
      console.log(response);
    } catch (error) {
      console.log(error.stack);
      throw new HttpException(error.response, error.status);
    }
  }

  /**
   * find an record, if it has not existed, a new record with data input will be executed
   * If returnFullRecord is true will return full record else return last inserted id
   * @param conditions {any}
   * @param dataInput {any}
   * @param returnFullRecord {boolean}
   * @param showLog {boolean}
   */
  async findOneAndCreate(
    conditions: any,
    dataInput: any,
    returnFullRecord: boolean = false,
    showLog: boolean = SHOW_LOG_ON_FIND_ONE_AND_CREATE,
  ) {
    if (showLog) {
      this._logger.log(
        `=============== [MYSQL] FIND ONE AND CREATE ON ${this.table} ================`,
      );
    }
    try {
      let checkRecordExist = await this.findOne(conditions);
      if (!checkRecordExist) {
        return await this.createOne(dataInput, returnFullRecord, showLog);
      }

      return;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  /**
   * Show one record by primary key id
   * @param id
   * @returns
   */
  async findById(id: number | any) {
    this._logger.log(
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
   *
   * @param conditions
   * @param inputData
   * @param returnFullRecord {boolean : False}
   * @param showLog
   * @returns
   */
  async update(
    conditions: number | object,
    inputData: object,
    returnFullRecord: boolean = false,
    showLog = true,
  ) {
    try {
      if (showLog) {
        this._logger.warn(
          `=============== [MYSQL] UPDATE ON ${this.table} ================`,
        );
      }

      if (typeof inputData !== 'object') {
        throw new HttpException(
          'Tham s??? truy???n v??o kh??ng h???p l???.',
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

      sql = formatRawStringCondition(sql);

      await this.databaseService.executeQueryWritePool(sql);

      if (returnFullRecord) {
        const updatedData =
          typeof conditions === 'object'
            ? await this.findOneInWritePool(conditions)
            : await this.findByIdInWritePool(conditions);

        return updatedData;
      }
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }

  /**
   * Delete a / some records  by conditions
   * @param conditions
   * @param returnFullRecord {boolean} default as false
   * @param showLog {boolean} default as false
   * @returns
   */
  async delete(
    conditions: number | object,
    returnFullRecord: boolean = false,
    showLog: boolean = true,
  ) {
    try {
      if (showLog) {
        this._logger.error(
          `=============== [MYSQL] DELETE ON ${this.table} ================`,
        );
      }
      let deletedData;
      if (returnFullRecord) {
        deletedData =
          typeof conditions === 'object'
            ? await this.findOneInWritePool(conditions)
            : await this.findByIdInWritePool(conditions);
      }

      let queryString = `DELETE FROM ${this.table} WHERE `;

      let res;
      if (typeof conditions === 'object') {
        if (Array.isArray(conditions)) {
          for (let i = 0; i < conditions.length; i++) {
            if (typeof conditions[i] !== 'object') {
              throw new HttpException(
                'Sai c?? ph??p truy v???n',
                HttpStatus.BAD_REQUEST,
              );
            }
            Object.entries(conditions).forEach(([key, val], i) => {
              if (i === 0) {
                queryString += formatTypeValueToInSertSQL(key, val);
              } else {
                queryString += ` OR ${formatTypeValueToInSertSQL(key, val)}`;
              }
            });
          }
        } else {
          Object.entries(conditions).forEach(([key, val], i) => {
            if (i === 0) {
              queryString += formatTypeValueToInSertSQL(key, val);
            } else {
              queryString += ` AND ${formatTypeValueToInSertSQL(key, val)}`;
            }
          });
        }

        queryString = formatRawStringCondition(queryString);

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

      if (returnFullRecord) {
        return deletedData;
      }

      return true;
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
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

  private async findManyInWritePool(
    options: any = {},
    showLog = SHOW_LOG_ON_FIND_MANY,
  ) {
    try {
      if (showLog) {
        this._logger.log(
          `=============== [MYSQL] FIND ON ${this.table} ================`,
        );
      }

      const optionKeys = Object.keys(options);
      const collection = new BaseConfigure(this.table);

      if (
        !Object.keys(options).some(
          (val) =>
            val.toLowerCase() === 'where' ||
            /(exclusiveConditionsCmds.join("|"))/gi.test(val),
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

      const res = await this.databaseService.executeQueryWritePool(
        collection.sql(),
      );
      let results: any[] = [];

      for (let result of res[0]) {
        results.push(preprocessDatabaseBeforeResponse(result));
      }

      return results;
    } catch (err) {
      throw new HttpException(err.stack, err.status || err.code);
    }
  }

  private async findOneInWritePool(
    options: any,
    showLog: boolean = SHOW_LOG_ON_FIND_ONE,
  ): Promise<any> {
    try {
      if (showLog) {
        this._logger.log(
          `=============== [MYSQL] FIND ONE ON ${this.table} ================`,
        );
      }

      if (typeof options !== 'object') {
        throw new HttpException(
          'Tham s??? ????a v??o ph???i l?? Object',
          HttpStatus.BAD_REQUEST,
        );
      }
      let results;

      if (
        Object.keys(options).some(
          (val) =>
            val.toLowerCase() === 'where' ||
            /(exclusiveConditionsCmds.join("|"))/gi.test(val),
        )
      ) {
        results = await this.findManyInWritePool(
          { ...options, limit: 1 },
          false,
        );
      } else {
        results = await this.findManyInWritePool(
          { where: options, limit: 1 },
          false,
        );
      }

      return await preprocessDatabaseBeforeResponse(results[0]);
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }

  private async findByIdInWritePool(id: number | any) {
    this._logger.log(
      `=============== [MYSQL] FIND BY ID ON ${this.table} ================`,
    );

    const stringQuery = `SELECT * FROM ${this.table} WHERE ?`;

    let rows;
    if (typeof id === 'object') {
      rows = await this.databaseService.executeQueryWritePool(stringQuery, [
        id,
      ]);
    } else {
      rows = await this.databaseService.executeQueryWritePool(stringQuery, [
        { [AutoIncrementKeys[this.table]]: id },
      ]);
    }

    const result = rows[0];

    return preprocessDatabaseBeforeResponse(result[0]);
  }

  async query(queryString: string) {
    try {
      return this.databaseService.query(queryString);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
