import { BadRequestException, ConsoleLogger, Injectable } from '@nestjs/common';
import {
  CustomRepositoryCannotInheritRepositoryError,
  UsingJoinColumnIsNotAllowedError,
} from 'typeorm';
import { Condition } from '../base/interfaces/collection.interfaces';
import { SortBy } from './enums/index';
export class DatabaseCollection {
  private table: string;

  private stringSelect: string;
  private alias: string;
  private arrayTable: any[];
  private stringJoin: string;
  private arrayCondition: any[];
  private stringCondition: string;
  private sortString: string;
  private limit: number;
  private offset: number;

  constructor(table) {
    this.table = table;
    this.stringSelect = 'SELECT * ';
    this.alias = '';
    this.arrayTable = [];
    this.stringJoin = '';
    this.arrayCondition = [];
    this.stringCondition = ' ';
    this.sortString = '';
    this.limit = 999999;
    this.offset = 0;
  }

  reset(): void {
    this.stringSelect = `SELECT ${this.alias ? `${this.alias}.*` : '*'} `;
    this.alias = '';
    this.arrayTable = [];
    this.stringJoin = '';
    this.arrayCondition = [];
    this.stringCondition = ' ';
    this.sortString = ' ';
    this.limit = 20;
    this.offset = 0;
  }

  addSelect(arrayField: string[]): string {
    if (Array.isArray(arrayField) && arrayField.length) {
      for (let i = 0; i < arrayField.length; i++) {
        if (i === 0) {
          this.stringSelect = `SELECT ${arrayField[i]}`;
          continue;
        }
        this.stringSelect += `, ${arrayField[i]}`;
      }
    } else {
      this.stringSelect = `SELECT *`;
    }

    return this.stringSelect;
  }

  select(fields: string[] | string): string {
    if (typeof fields === 'string' && fields) {
      this.stringSelect = `SELECT ${fields}`;
    } else if (Array.isArray(fields) && fields.length) {
      for (let i = 0; i < fields.length; i++) {
        if (i === 0) {
          this.stringSelect = `SELECT ${fields[i]}`;
          continue;
        }
        this.stringSelect += `, ${fields[i]}`;
      }
    } else {
      this.stringSelect = `SELECT *`;
    }

    return this.stringSelect;
  }

  setOffset(offset): void {
    this.offset = offset;
  }

  addJoin(table, fieldJoin, rootJoin, typeJoin = ''): string {
    this.stringJoin += ` ${typeJoin} ${table} ON ${fieldJoin} = ${rootJoin} `;
    return this.stringJoin;
  }

  checkAndReplaceTypeOfJoin(typeOfJoin) {
    let typeJoin = '';

    switch (typeOfJoin) {
      case 'leftJoin':
        typeJoin = 'LEFT JOIN';
      case 'rightJoin':
        typeJoin = 'RIGHT JOIN';
      case 'innerJoin':
        typeJoin = 'INNER JOIN';
      case 'crossJoin':
        typeJoin = 'CROSS JOIN';
      default:
        typeJoin = 'JOIN';
    }
    return typeJoin;
  }

  /**
   *
   * @param rootJoinedField The field of the root table which is joined from other tables
   * @param tableJoinedName The name of the current table which join to root table
   * @param joinedField The field of the current table connecting the root table
   */
  checkTableJoin(
    rootJoinedField: string,
    tableJoinedName: string,
    joinedField: string,
  ) {
    const splitRootJoinedField = rootJoinedField.split('.');
    const splitJoinedField = joinedField.split('.');
    let newJoinedField = joinedField;
    let newRootJoinedField = rootJoinedField;
    if (splitRootJoinedField.length < 2) {
      newRootJoinedField = `${this.alias || this.table}.${rootJoinedField}`;
    }
    if (splitJoinedField.length < 2) {
      newJoinedField = `${tableJoinedName}.${joinedField}`;
    }

    return { fieldJoin: newJoinedField, rootJoin: newRootJoinedField };
  }

  join(objFields: any): void {
    if (objFields.alias) {
      this.alias = objFields.alias;
    }
    const typesOfJoin = Object.keys(objFields).filter((field) =>
      /join/gi.test(field),
    );
    for (let typeOfJoin of typesOfJoin) {
      const listJoins = objFields[typeOfJoin];
      const tableNames = Object.keys(listJoins);
      for (let table of tableNames) {
        const { fieldJoin, rootJoin } = objFields[typeOfJoin][table];

        const result = this.checkTableJoin(rootJoin, table, fieldJoin);

        this.addJoin(table, result.fieldJoin, result.rootJoin, typeOfJoin);
      }
    }
  }

  andWhere(field, operation, value): void {
    if (field != '') {
      if (operation == 'LIKE') {
        value = `'%${value}%'`;
      } else {
        value = `'${value}'`;
      }

      let condition = {
        connect: 'AND',
        field: field,
        operation: operation != '' ? operation : '=',
        value: value,
      };

      this.arrayCondition.push(condition);
    }
  }

  orWhere(field, operation, value): void {
    if (field != '') {
      if (operation == 'LIKE') {
        value = `'%${value}%'`;
      } else {
        value = `'${value}'`;
      }

      let condition = {
        connect: 'OR',
        field: field,
        operation: operation != '' ? operation : '=',
        value: value,
      };

      this.arrayCondition.push(condition);
    }
  }

  andOrWhere(field, operation, value, pos_cond): void {
    if (field != '') {
      if (operation == 'LIKE') {
        value = `'%${value}%'`;
      } else {
        value = `'${value}'`;
      }

      let condition: any = {
        operation: operation != '' ? operation : '=',
      };
      switch (pos_cond) {
        case 'first':
          condition.connect = 'AND';
          condition.field = '(' + field;
          condition.value = value;
          break;
        case 'middle':
          condition.connect = 'OR';
          condition.field = field;
          condition.value = value;
          break;
        case 'last':
          condition.connect = 'OR';
          condition.field = field;
          condition.value = value + ')';
          break;
        default:
      }

      this.arrayCondition.push(condition);
    }
  }

  orAndWhere(field, operation, value, pos_cond): void {
    if (field != '') {
      if (operation.toUpperCase() == 'LIKE') {
        value = `'%${value}%'`;
      } else {
        value = `'${value}'`;
      }

      let condition: any = {
        operation: operation != '' ? operation : '=',
      };
      switch (pos_cond) {
        case 'first':
          condition.connect = 'OR';
          condition.field = '(' + field;
          condition.value = value;
          break;
        case 'middle':
          condition.connect = 'AND';
          condition.field = field;
          condition.value = value;
          break;
        case 'last':
          condition.connect = 'AND';
          condition.field = field;
          condition.value = value + ')';
          break;
        default:
      }

      this.arrayCondition.push(condition);
    }
  }
  orderBy(sortArray: { field: string; sortBy: SortBy }[]): void {
    if (sortArray.length) {
      let sortString = '';
      for (let i = 0; i < sortArray.length; i++) {
        const { field, sortBy } = sortArray[i];
        if (i === 0) {
          sortString += ` ${field} ${sortBy}`;
          continue;
        }
        sortString += `, ${field} ${sortBy}`;
      }
      this.sortString = sortString;
    }
  }

  where(objFields: any): void {
    if (typeof objFields !== 'object') {
      throw new BadRequestException('Cú pháp truy vấn SQL không hợp lệ.');
    }
    // Array is considered as OR operator, so we will connect with orAndWhere each other
    if (Array.isArray(objFields)) {
      this.orCondition(objFields);
      return;
    }

    // Object us considered as AND operator, so we will connect with andOrWhere each other
    this.andCondition(objFields);
  }

  andCondition(objFields: any): void {
    Object.entries(objFields).forEach(([field, val], i) => {
      let value = val;
      let operator = '=';

      if (typeof val !== 'object') {
        this.andWhere(field, operator, val);
      } else if (typeof val === 'object') {
        if (Array.isArray(val)) {
          if (val.length === 1) {
            this.andWhere(field, operator, val[0]);
          } else {
            for (let j = 0; j < val.length; j++) {
              let subValue = val[j];
              let subOperator = '=';
              if (typeof subValue !== 'object') {
                if (j === 0) {
                  this.andOrWhere(field, subOperator, subValue, 'first');
                } else if (j === val.length - 1) {
                  this.andOrWhere(field, subOperator, subValue, 'last');
                } else {
                  this.andOrWhere(field, subOperator, subValue, 'middle');
                }
              } else if (
                typeof subValue === 'object' &&
                !Array.isArray(subValue)
              ) {
                subValue = val[j]['value'];
                subOperator = val[j]['operator'];
                if (j === 0) {
                  this.andOrWhere(field, subOperator, subValue, 'first');
                } else if (j === val.length - 1) {
                  this.andOrWhere(field, subOperator, subValue, 'last');
                } else {
                  this.andOrWhere(field, subOperator, subValue, 'middle');
                }
              }
            }
          }
        } else {
          value = val['value'];
          operator = val['operator'];
          this.andWhere(field, operator, value);
        }
      }
    });
  }

  orCondition(arrayFields: any): void {
    for (let i = 0; i < arrayFields.length; i++) {
      Object.entries(arrayFields[i]).forEach(([field, val], j) => {
        let value = val['value'] || val;
        let operator = val['operator'] || '=';

        if (typeof val !== 'object') {
          if (Object.entries(arrayFields[i]).length > 1) {
            if (j === 0) {
              this.orAndWhere(field, operator, value, 'first');
            } else if (j === Object.entries(arrayFields[i]).length - 1) {
              this.orAndWhere(field, operator, value, 'last');
            } else {
              this.orAndWhere(field, operator, value, 'middle');
            }
          } else {
            this.orWhere(field, operator, value);
          }
        } else if (typeof val === 'object') {
          if (Array.isArray(val)) {
            for (let k = 0; k < value.length; k++) {
              let subValue = val[j]['value'] || val[j];
              let subOperator = val[j]['operator'] || '=';

              if (Object.entries(arrayFields[i]).length > 1) {
                if (j === 0 && k === 0) {
                  this.orAndWhere(field, subOperator, subValue, 'first');
                } else if (
                  j === Object.entries(arrayFields[i]).length - 1 &&
                  k === value.length - 1
                ) {
                  this.orAndWhere(field, subOperator, subValue, 'last');
                } else {
                  this.orAndWhere(field, subOperator, subValue, 'middle');
                }
              } else {
                this.orWhere(field, subOperator, subValue);
              }
            }
          } else {
            if (Object.entries(arrayFields[i]).length > 1) {
              if (j === 0) {
                this.orAndWhere(field, operator, value, 'first');
              } else if (j === Object.entries(arrayFields[i]).length - 1) {
                this.orAndWhere(field, operator, value, 'last');
              } else {
                this.orAndWhere(field, operator, value, 'middle');
              }
            } else {
              this.orWhere(field, operator, value);
            }
          }
        }
      });
    }
  }

  setSkip(offset: number): void {
    this.offset = offset;
  }

  setLimit(limit: number): void {
    this.limit = limit;
  }

  sqlCount(): string {
    this.stringCondition = this.genCondition();
    const sql = `SELECT count(*) AS total FROM ${this.table} ${this.alias} ${this.stringJoin} ${this.stringCondition}`;
    // this.arrayCondition.length === 0
    //   ? `SELECT count(*) AS total FROM ${this.table} ${this.alias} ${this.stringJoin}`
    //   : `SELECT count(*) AS total    ${this.table} ${this.alias} ${this.stringJoin} ${this.stringCondition}`;
    return sql;
  }

  sqlById(id): string {
    let sql_string = '';
    sql_string =
      this.stringSelect +
      ` FROM ${this.table} ${this.alias} ` +
      this.stringJoin +
      ` WHERE ${this.alias}.id= ${id} LIMIT 1 `;
    this.reset();
    return sql_string;
  }

  sql(is_limit = true): string {
    let sql_string = '';
    this.stringCondition = this.genCondition();
    const orderString = this.sortString
      ? 'ORDER BY ' + this.sortString
      : this.sortString;
    sql_string =
      this.stringSelect +
      ` FROM ${this.table} ${this.alias} ` +
      this.stringJoin +
      this.stringCondition +
      orderString;
    if (is_limit == true) {
      sql_string += ` LIMIT ${this.limit} OFFSET ${this.offset}`;
    }

    this.reset();
    return sql_string;
  }

  finallizeTotalCount(): string {
    const condition = this.genCondition();
    const sql =
      this.arrayCondition.length === 0
        ? `SELECT count(1) AS total FROM ${this.table} ${this.alias} ${this.stringJoin}`
        : `SELECT count(1) AS total FROM ${this.table} ${this.alias} ${this.stringJoin} ${condition}`;
    return sql;
  }

  finallizeTotalDistinctCount(col): string {
    const condition = this.genCondition();
    const sql =
      this.arrayCondition.length === 0
        ? `SELECT count(Distinct ${col}) AS total FROM ${this.table} ${this.alias} ${this.stringJoin}`
        : `SELECT count(Distinct ${col}) AS total FROM ${this.table} ${this.alias} ${this.stringJoin} ${condition}`;
    return sql;
  }

  // This is old version, may be deprecated in the future
  // genCondition(): string {
  //   let stringCondition = '';
  //   if (this.arrayCondition.length > 0) {
  //
  //     let arrayCheckExist = [];
  //     for (let i = 0; i < this.arrayCondition.length; i++) {
  //       arrayCheckExist[
  //         this.arrayCondition[i].field + '_' + this.arrayCondition[i].value
  //       ] = this.arrayCondition[i];
  //     }

  //     let i = 0;
  //     for (let data in arrayCheckExist) {
  //       if (i == 0) {
  //         stringCondition += `WHERE ${arrayCheckExist[data].field} ${arrayCheckExist[data].operation} ${arrayCheckExist[data].value} `;
  //       } else {
  //         stringCondition += ` ${arrayCheckExist[data].connect} ${arrayCheckExist[data].field} ${arrayCheckExist[data].operation} ${arrayCheckExist[data].value} `;
  //       }
  //       i++;
  //     }
  //   }
  //   return stringCondition;
  // }

  genCondition(): string {
    let stringCondition = '';
    if (this.arrayCondition.length > 0) {
      let arrayCheckExist = [];
      for (let i = 0; i < this.arrayCondition.length; i++) {
        arrayCheckExist = [...arrayCheckExist, this.arrayCondition[i]];
      }

      for (let [i, checkExistItem] of arrayCheckExist.entries()) {
        if (i == 0) {
          stringCondition += `WHERE ${checkExistItem.field} ${checkExistItem.operation} ${checkExistItem.value} `;
        } else {
          stringCondition += ` ${checkExistItem.connect} ${checkExistItem.field} ${checkExistItem.operation} ${checkExistItem.value} `;
        }
      }
    }
    return stringCondition;
  }
}
