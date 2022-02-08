import { HttpException, Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { DatabaseCollection } from '../database/database.collection';
import { Table, PrimaryKeys } from '../database/enums/index';
import { HttpStatus } from '@nestjs/common';
import { preprocessDatabaseBeforeResponse } from '../utils/helper';
const orderCmds = [
  'select',
  'from',
  'join',
  'where',
  'skip',
  'limit',
  'orderBy',
];
@Injectable()
export class BaseRepositorty<T> {
  private logger = new Logger(BaseRepositorty.name);
  constructor(
    protected readonly databaseService: DatabaseService,
    protected table: Table,
  ) {
    this.table = table;
  }

  setData(data, props) {
    let userGroupDataObject = {};
    for (let [key, val] of Object.entries(data)) {
      if (props.includes(key)) {
        userGroupDataObject[key] = val;
      }
    }
    return userGroupDataObject;
  }

  /**
   * Create new record
   * @param params
   * @returns
   */
  async create(params: any): Promise<any> {
    this.logger.log('=============== create ================');

    if (Array.isArray(params) || typeof params !== 'object') {
      throw new HttpException(
        'Tham số truyền vào phải là một Object',
        HttpStatus.BAD_REQUEST,
      );
    }
    let sql = `INSERT INTO ${this.table} SET ? `;

    await this.databaseService.executeQuery(sql, params);
    const res = await this.databaseService.executeQuery(
      'SELECT LAST_INSERT_ID();',
    );

    console.log(46, res[0][0]['LAST_INSERT_ID()']);
    if (res[0][0]['LAST_INSERT_ID()'] === 0) {
      return this.findOne({ where: params });
    }
    return this.findById(res[0][0]['LAST_INSERT_ID()']);
  }

  /**
   * Show one record by primary key id
   * @param id
   * @returns
   */
  async findById(id: number | any): Promise<T> {
    this.logger.log('=============== Find By Id ================');

    const stringQuery = `SELECT * FROM ${this.table} WHERE ?`;

    let rows;
    if (typeof id === 'object') {
      rows = await this.databaseService.executeQuery(stringQuery, [id]);
    } else {
      rows = await this.databaseService.executeQuery(stringQuery, [
        { [PrimaryKeys[this.table]]: id },
      ]);
    }

    const result = rows[0];

    return preprocessDatabaseBeforeResponse(result[0]);
  }

  /**
   * Find one record by item
   * @param options
   * @returns
   */
  async findOne(options: any): Promise<any> {
    this.logger.log('=============== FIND ONE ================');
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
      results = await this.find({ ...options, limit: 1 });
    } else {
      results = await this.find({ where: options, limit: 1 });
    }

    return preprocessDatabaseBeforeResponse(results[0]);
  }

  /**
   * Find items by multi filters
   * @param options
   * @returns array
   */
  async find(options: any): Promise<any[]> {
    this.logger.log('=============== FIND ================');
    const optionKeys = Object.keys(options);

    const collection = new DatabaseCollection(this.table);
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

    const res = await this.databaseService.executeQuery(collection.sql());
    let results: any[] = [];

    for (let result of res[0]) {
      results.push(preprocessDatabaseBeforeResponse(result));
    }
    return results;
  }

  /**
   * Update one record by primary key
   * @param id primary key
   * @param params object<any> with
   * @returns
   */
  async update(id: number | any, params: any): Promise<T> {
    this.logger.log('=============== UPDATE ================');

    if (typeof params !== 'object') {
      throw new HttpException(
        'Tham số truyền vào không hợp lệ.',
        HttpStatus.BAD_REQUEST,
      );
    }

    let sql = `UPDATE ${this.table} SET `;
    Object.entries(params).forEach(([key, val], i) => {
      if (i === 0) {
        sql +=
          typeof val === 'number' ? `${key} = ${val}` : `${key} = '${val}'`;
      } else {
        sql +=
          typeof val === 'number' ? `, ${key} = ${val}` : `, ${key} = '${val}'`;
      }
    });
    sql += ' WHERE ';

    if (typeof id === 'object') {
      Object.entries(id).forEach(([key, val], i) => {
        if (i === 0) {
          sql +=
            typeof val === 'number' ? `${key} = ${val}` : `${key} = '${val}'`;
        } else {
          sql +=
            typeof val === 'number'
              ? ` AND ${key} = ${val}`
              : ` AND ${key} = '${val}'`;
        }
      });
    } else {
      sql += ` ${PrimaryKeys[this.table]} = '${id}'`;
    }

    await this.databaseService.executeQuery(sql);

    const updatedUser =
      typeof id === 'object' ? await this.findOne(id) : await this.findById(id);
    return updatedUser;
  }

  async delete(option: number | any): Promise<boolean> {
    this.logger.log('=============== DELETE BY option ================');

    let queryString = `DELETE FROM ${this.table} WHERE `;
    let res;
    if (typeof option === 'object') {
      if (Array.isArray(option)) {
        for (let i = 0; i < option.length; i++) {
          if (typeof option[i] !== 'object') {
            throw new HttpException(
              'Sai cú pháp truy vấn',
              HttpStatus.BAD_REQUEST,
            );
          }
          Object.entries(option).forEach(([key, val], i) => {
            if (i === 0) {
              queryString += `${key} = ${val}`;
            } else {
              queryString += ` OR ${key} = ${val}`;
            }
          });
        }
      } else {
        Object.entries(option).forEach(([key, val], i) => {
          if (i === 0) {
            queryString += `${key} = ${val}`;
          } else {
            queryString += ` AND ${key} = ${val}`;
          }
        });
      }
      res = await this.databaseService.executeQuery(queryString, [option]);
    } else {
      queryString += ` ? `;
      res = await this.databaseService.executeQuery(queryString, [
        { [PrimaryKeys[this.table]]: option },
      ]);
    }

    if (res[0].affectedRows === 0) {
      return false;
    }
    return true;
  }
}
