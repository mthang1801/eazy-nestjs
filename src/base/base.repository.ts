import { HttpException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { DatabaseCollection } from '../database/database.collection';
import { Table, PrimaryKeys } from '../database/enums/index';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class BaseRepositorty<T> {
  constructor(
    protected readonly databaseService: DatabaseService,
    protected table: Table,
  ) {
    this.table = table;
  }

  /**
   * Create new record
   * @param params
   * @returns
   */
  async create(params: any): Promise<any> {
    console.log('=============== create ================');

    if (Array.isArray(params) || typeof params !== 'object') {
      throw new HttpException(
        'Tham số truyền vào phải là Object',
        HttpStatus.BAD_REQUEST,
      );
    }
    let sql = `INSERT INTO ${this.table} SET ?`;

    await this.databaseService.executeQuery(sql, params);
    let filters = [];
    for (let [key, val] of Object.entries(params)) {
      filters.push({ [key]: val });
    }

    return this.findOne({ where: params });
  }

  /**
   * Show one record by primary key id
   * @param id
   * @returns
   */
  async findById(id: number): Promise<T> {
    console.log('=============== Find By Id ================');

    const stringQuery = `SELECT * FROM ${this.table} WHERE ?`;

    const rows = await this.databaseService.executeQuery(stringQuery, [
      { [PrimaryKeys[this.table]]: id },
    ]);
    const result = rows[0];

    return result[0];
  }

  /**
   * Find one record by item
   * @param options
   * @returns
   */
  async findOne(options: any): Promise<any> {
    console.log('=============== FIND ONE ================');

    const results = await this.find({ ...options, limit: 1 });

    return results[0];
  }

  /**
   * Find items by multi filters
   * @param options
   * @returns array
   */
  async find(options: any): Promise<any[]> {
    console.log('=============== FIND ================');
    const optionKeys = Object.keys(options);
    const orderCmds = [
      'select',
      'from',
      'join',
      'where',
      'skip',
      'limit',
      'orderBy',
    ];

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

    const results = await this.databaseService.executeQuery(collection.sql());
    return results[0];
  }

  /**
   * Update one record by primary key
   * @param id primary key
   * @param params object<any> with
   * @returns
   */
  async update(id: number, params: any): Promise<T> {
    console.log('=============== UPDATE BY ID ================');

    if (typeof params !== 'object') {
      throw new HttpException(
        'Tham số truyền vào không đúng định dạng',
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

    sql += ` WHERE ${PrimaryKeys[this.table]} = '${id}'`;

    await this.databaseService.executeQuery(sql);
    const updatedUser = await this.findById(id);
    return updatedUser;
  }

  async delete(id: number): Promise<boolean> {
    console.log('=============== DELETE BY ID ================');

    const queryString = `DELETE FROM ${this.table} WHERE ?`;

    const res = await this.databaseService.executeQuery(queryString, [
      { [PrimaryKeys[this.table]]: id },
    ]);
    if (res[0].affectedRows === 0) {
      throw new HttpException(
        `Not found id = ${id} in ${this.table} to delete`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return true;
  }
}
