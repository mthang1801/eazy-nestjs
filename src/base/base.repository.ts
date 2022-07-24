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

@Injectable()
export class BaseRepositorty {
  private logger = new Logger(BaseRepositorty.name);
  private _tableProps: string[];
  private _defaultValues: any;
  constructor(
    protected readonly databaseService: DatabaseService,
    protected table: Table,
  ) {
    this.table = table;
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

    //Primiry keys is unique and db define

    delete dataObject[AutoIncrementKeys[this.table]];

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
   * @returns array
   */
  async findMany(options: any = {}, showLog = true) {
    if (showLog) {
      this.logger.log(
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

    const collection = new BaseConfigure(this.table);
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
   * Create One record. If creating success and returnable is true will return full record else return inserted id
   * @param inputData {any}
   * @param returnable {boolean}
   * @param showLog {boolean}
   * @returns
   */
  async createOne(
    inputData: any,
    returnable: boolean = false,
    showLog: boolean = SHOW_LOG_ON_CREATE_ONE,
  ): Promise<any> {
    try {
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
      let lastInsertId = JSON.parse(JSON.stringify(response[0]))['insertId'];
      if (returnable) {
        if (!lastInsertId) {
          throw new HttpException(
            'Không tìm thấy auto_increment_id của entity vừa tạo',
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

  async createMany(dataInput: any[], showLog: boolean = SHOW_LOG_ON_FIND_MANY) {
    try {
      if (showLog) {
        this.logger.log(
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
   * Show one record by primary key id
   * @param id
   * @returns
   */
  async findById(id: number | any) {
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
    try {
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
            ? await this.findOneInWritePool(conditions)
            : await this.findByIdInWritePool(conditions);

        return updatedData;
      }
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }

  async delete(
    conditions: number | object,
    returnable: boolean = false,
    showLog: boolean = true,
  ) {
    try {
      if (showLog) {
        this.logger.error(
          `=============== [MYSQL] DELETE ON ${this.table} ================`,
        );
      }
      let deletedData;
      if (returnable) {
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
        this.logger.log(
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
        this.logger.log(
          `=============== [MYSQL] FIND ONE ON ${this.table} ================`,
        );
      }

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
    this.logger.log(
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
}
