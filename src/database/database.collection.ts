import { BadRequestException, ConsoleLogger, Injectable } from '@nestjs/common';
import { formatTypeValueConditionSQL } from 'src/base/base.helper';

import {
  CustomRepositoryCannotInheritRepositoryError,
  UsingJoinColumnIsNotAllowedError,
} from 'typeorm';
import { Condition } from '../base/interfaces/collection.interfaces';
import { SortBy } from './enums/index';
import {
  formatStringCondition,
  formatHavingCondition,
} from './database.helper';
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
  private stringGroupBy: string | number | string[] | number[];
  private stringHaving: string;
  private arrayHaving: any[];

  constructor(table) {
    this.table = table;
    this.stringSelect = 'SELECT * ';
    this.alias = '';
    this.arrayTable = [];
    this.stringJoin = '';
    this.arrayCondition = [];
    this.stringCondition = ' ';
    this.sortString = '';
    this.stringGroupBy = '';
    this.stringHaving = '';
    this.arrayHaving = [];
    this.limit = 99999999999;
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
    this.stringGroupBy = '';
    this.stringHaving = '';
    this.arrayHaving = [];
    this.limit = 20;
    this.offset = 0;
  }

  public addSelect(arrayField: string[]): string {
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
    const splitRootJoinedField = rootJoinedField?.split('.');
    const splitJoinedField = joinedField?.split('.');
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

  andWhere(field, operation, value, type): void {
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

      type === 'having'
        ? this.arrayHaving.push(condition)
        : this.arrayCondition.push(condition);
    }
  }

  andWhereBetween(field, value1, value2, type): void {
    if (field != '') {
      let condition = {
        connect: 'AND',
        field: field,
        operation: `BETWEEN ${formatTypeValueConditionSQL(value1)} AND`,
        value: formatTypeValueConditionSQL(value2),
      };

      this.arrayCondition.push(condition);
    }
  }

  orWhere(field, operation, value, type): void {
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

      type === 'having'
        ? this.arrayHaving.push(condition)
        : this.arrayCondition.push(condition);
    }
  }

  orWhereBetween(field, value1, value2, type): void {
    if (field != '') {
      let condition = {
        connect: 'OR',
        field: field,
        operation: `BETWEEN ${value1} AND`,
        value: value2,
      };

      this.arrayCondition.push(condition);
    }
  }

  andOrWhere(field, operation, value, pos_cond, type): void {
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

      type === 'having'
        ? this.arrayHaving.push(condition)
        : this.arrayCondition.push(condition);
    }
  }

  andOrWhereBetween(field, value1, value2, pos_cond): void {
    if (field != '') {
      let condition: any = {
        operation: `BETWEEN ${formatTypeValueConditionSQL(value1)} AND`,
      };
      switch (pos_cond) {
        case 'first':
          condition.connect = 'AND';
          condition.field = '(' + field;
          condition.value = formatTypeValueConditionSQL(value2);
          break;
        case 'middle':
          condition.connect = 'OR';
          condition.field = field;
          condition.value = formatTypeValueConditionSQL(value2);
          break;
        case 'last':
          condition.connect = 'OR';
          condition.field = field;
          condition.value = formatTypeValueConditionSQL(value2) + ')';
          break;
        default:
      }

      this.arrayCondition.push(condition);
    }
  }

  orAndWhere(field, operation, value, pos_cond, type): void {
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

      type === 'having'
        ? this.arrayHaving.push(condition)
        : this.arrayCondition.push(condition);
    }
  }

  orAndWhereBetween(field, value1, value2, pos_cond, type): void {
    if (field != '') {
      let condition: any = {
        operation: `BETWEEN ${formatTypeValueConditionSQL(value1)} AND`,
      };
      switch (pos_cond) {
        case 'first':
          condition.connect = 'OR';
          condition.field = '(' + field;
          condition.value = formatTypeValueConditionSQL(value2);
          break;
        case 'middle':
          condition.connect = 'AND';
          condition.field = field;
          condition.value = formatTypeValueConditionSQL(value2);
          break;
        case 'last':
          condition.connect = 'AND';
          condition.field = field;
          condition.value = formatTypeValueConditionSQL(value2) + ')';
          break;
        default:
      }

      type === 'having'
        ? this.arrayHaving.push(condition)
        : this.arrayCondition.push(condition);
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
      if (
        objFields.some(
          (objItem) =>
            objItem.hasOwnProperty('$or') || objItem.hasOwnProperty('$and'),
        )
      ) {
        return this.setCondition(objFields);
      }
      return this.orCondition(objFields);
    }

    // Object us considered as AND operator, so we will connect with andOrWhere each other
    this.andCondition(objFields);
  }

  setCondition(objFields) {
    let sqlQuery = '';
    for (let objFieldItem of objFields) {
      sqlQuery += this.handleReursiveCondition(objFieldItem, sqlQuery);
    }
    console.log(sqlQuery);
  }

  handleReursiveCondition(objFieldItem, sqlQuery = '') {
    if (typeof objFieldItem === 'object' && Array.isArray(objFieldItem)) {
      for (let _objFieldItem of objFieldItem) {
        sqlQuery += this.handleReursiveCondition(_objFieldItem, sqlQuery);
      }
    }
    if (
      !objFieldItem ||
      (objFieldItem && !Object.entries(objFieldItem).length)
    ) {
      return sqlQuery;
    }
    if (objFieldItem.hasOwnProperty('$or')) {
      for (let objValue of Object.values(objFieldItem)) {
        if (Array.isArray(objValue)) {
          for (let objValueItem of objValue) {
            if (
              (typeof objValueItem === 'object' &&
                objValueItem.hasOwnProperty('$or')) ||
              objValueItem.hasOwnProperty('$and')
            ) {
              sqlQuery += this.handleReursiveCondition(objValueItem, sqlQuery);
              continue;
            }
            for (let [i, [key, val]] of Object.entries(
              objValueItem,
            ).entries()) {
              sqlQuery += ` ${key} ${val['operator'] ? val['operator'] : '='} ${
                val['value'] != undefined ? `'${val['value']}'` : `'${val}'`
              } `;
            }
          }
        }
      }
    }
    if (objFieldItem.hasOwnProperty('$and')) {
    }
    return sqlQuery;
  }

  having(objFields: any): void {
    if (typeof objFields !== 'object') {
      throw new BadRequestException('Cú pháp truy vấn SQL không hợp lệ.');
    }

    // Array is considered as OR operator, so we will connect with orAndWhere each other
    if (Array.isArray(objFields)) {
      this.orCondition(objFields, 'having');
      return;
    }

    // Object us considered as AND operator, so we will connect with andOrWhere each other
    this.andCondition(objFields, 'having');
  }

  andCondition(objFields: any, type = 'where'): void {
    Object.entries(objFields).forEach(([field, val], i) => {
      let value = val;
      let operator = '=';

      if (typeof val !== 'object') {
        this.andWhere(field, operator, val, type);
      } else if (typeof val === 'object') {
        if (Array.isArray(val)) {
          if (val.length === 1) {
            this.andWhere(field, operator, val[0], type);
          } else {
            for (let j = 0; j < val.length; j++) {
              let subValue = val[j];
              let subOperator = '=';
              if (typeof subValue !== 'object') {
                if (j === 0) {
                  this.andOrWhere(field, subOperator, subValue, 'first', type);
                } else if (j === val.length - 1) {
                  this.andOrWhere(field, subOperator, subValue, 'last', type);
                } else {
                  this.andOrWhere(field, subOperator, subValue, 'middle', type);
                }
              } else if (
                typeof subValue === 'object' &&
                !Array.isArray(subValue)
              ) {
                subValue = val[j]['value'];
                subOperator = val[j]['operator'];
                if (j === 0) {
                  this.andOrWhere(field, subOperator, subValue, 'first', type);
                } else if (j === val.length - 1) {
                  this.andOrWhere(field, subOperator, subValue, 'last', type);
                } else {
                  this.andOrWhere(field, subOperator, subValue, 'middle', type);
                }
              }
            }
          }
        } else {
          if (val['operator'] == 'BETWEEN') {
            let valueMin = val['value1'];
            let valueMax = val['value2'];

            this.andWhereBetween(field, valueMin, valueMax, type);
          } else {
            value = val['value'];
            operator = val['operator'];
            this.andWhere(field, operator, value, type);
          }
        }
      }
    });
  }

  orCondition(arrayFields: any, type = 'where'): void {
    for (let i = 0; i < arrayFields.length; i++) {
      Object.entries(arrayFields[i]).forEach(([field, val], j) => {
        if (val['operator'] == 'BETWEEN') {
          let valueMin = val['value1'];
          let valueMax = val['value2'];

          if (Object.entries(arrayFields[i]).length > 1) {
            if (j === 0) {
              this.orAndWhereBetween(field, valueMin, valueMax, 'first', type);
            } else if (j === Object.entries(arrayFields[i]).length - 1) {
              this.orAndWhereBetween(field, valueMin, valueMax, 'last', type);
            } else {
              this.orAndWhereBetween(field, valueMin, valueMax, 'middle', type);
            }
          } else {
            this.orWhereBetween(field, valueMin, valueMax, type);
          }
        } else {
          let value = val['value'] || val;
          let operator = val['operator'] || '=';

          if (typeof val !== 'object') {
            if (Object.entries(arrayFields[i]).length > 1) {
              if (j === 0) {
                this.orAndWhere(field, operator, value, 'first', type);
              } else if (j === Object.entries(arrayFields[i]).length - 1) {
                this.orAndWhere(field, operator, value, 'last', type);
              } else {
                this.orAndWhere(field, operator, value, 'middle', type);
              }
            } else {
              this.orWhere(field, operator, value, type);
            }
          } else if (typeof val === 'object') {
            if (Array.isArray(val)) {
              for (let k = 0; k < value.length; k++) {
                let subValue = val[j]['value'] || val[j];
                let subOperator = val[j]['operator'] || '=';

                if (Object.entries(arrayFields[i]).length > 1) {
                  if (j === 0 && k === 0) {
                    this.orAndWhere(
                      field,
                      subOperator,
                      subValue,
                      'first',
                      type,
                    );
                  } else if (
                    j === Object.entries(arrayFields[i]).length - 1 &&
                    k === value.length - 1
                  ) {
                    this.orAndWhere(field, subOperator, subValue, 'last', type);
                  } else {
                    this.orAndWhere(
                      field,
                      subOperator,
                      subValue,
                      'middle',
                      type,
                    );
                  }
                } else {
                  this.orWhere(field, subOperator, subValue, type);
                }
              }
            } else {
              if (Object.entries(arrayFields[i]).length > 1) {
                if (j === 0) {
                  this.orAndWhere(field, operator, value, 'first', type);
                } else if (j === Object.entries(arrayFields[i]).length - 1) {
                  this.orAndWhere(field, operator, value, 'last', type);
                } else {
                  this.orAndWhere(field, operator, value, 'middle', type);
                }
              } else {
                this.orWhere(field, operator, value, type);
              }
            }
          }
        }
      });
    }
  }

  groupBy(groupChain): void {
    if (groupChain) {
      this.stringGroupBy = 'GROUP BY ';
      if (
        typeof groupChain === 'object' &&
        Array.isArray(groupChain) &&
        groupChain.length
      ) {
        this.stringGroupBy += groupChain.join(', ');
      } else {
        this.stringGroupBy += groupChain;
      }
      this.stringGroupBy += ' ';
    }
  }

  setSkip(offset: number): void {
    this.offset = offset;
  }

  setLimit(limit: number): void {
    this.limit = limit;
  }

  sqlCount(distinctParam: any = null): string {
    this.stringCondition = this.genCondition();
    const sql = distinctParam
      ? `SELECT count(${Object.keys[distinctParam][0]}.${
          Object.values(distinctParam)[0]
        } }) AS total FROM ${this.table} ${this.alias} ${this.stringJoin} ${
          this.stringCondition
        }`
      : `SELECT count(*) AS total FROM ${this.table} ${this.alias} ${this.stringJoin} ${this.stringCondition}`;

    return sql;
  }

  sql(is_limit = true): string {
    let sql_string = '';
    this.stringCondition = this.genCondition();
    this.stringHaving = this.genHaving();
    const orderString = this.sortString
      ? 'ORDER BY ' + this.sortString
      : this.sortString;
    sql_string =
      this.stringSelect +
      ` FROM ${this.table} ${this.alias} ` +
      this.stringJoin +
      this.stringGroupBy +
      this.stringHaving +
      this.stringCondition +
      orderString;
    if (is_limit == true) {
      sql_string += ` LIMIT ${this.limit} OFFSET ${this.offset} ; `;
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

  genCondition(): string {
    let stringCondition = '';
    if (this.arrayCondition.length > 0) {
      let arrayCheckExist = [];
      for (let i = 0; i < this.arrayCondition.length; i++) {
        arrayCheckExist = [...arrayCheckExist, this.arrayCondition[i]];
      }

      for (let [i, checkExistItem] of arrayCheckExist.entries()) {
        stringCondition += formatStringCondition(i, checkExistItem);
      }
    }
    return stringCondition;
  }

  genHaving(): string {
    let stringHaving = '';
    if (this.arrayHaving.length > 0) {
      let arrayCheckExist = [];
      for (let i = 0; i < this.arrayHaving.length; i++) {
        arrayCheckExist = [...arrayCheckExist, this.arrayHaving[i]];
      }

      for (let [i, checkExistItem] of arrayCheckExist.entries()) {
        stringHaving += formatHavingCondition(i, checkExistItem);
      }
    }
    return stringHaving;
  }
}
