import { preprocessAddTextDataToMysql } from '../../base/base.helper';
import {
  IAllOperator,
  IAnyOperator,
  IBetweenOperator,
  IEqualOperator,
  IGreaterThan,
  IInOperator,
  IIsNull,
  ILessThan,
  ILessThanOrEqual,
  ILikeOperator,
  INotOperator,
} from './operators.interface';

export function Like<T>(value: T): ILikeOperator<T> {
  let _value = preprocessAddTextDataToMysql(value);
  return { operator: 'LIKE', value: _value };
}

export function $like<T>(value: T): ILikeOperator<T> {
  let _value = preprocessAddTextDataToMysql(value);
  return { operator: 'LIKE', value: _value };
}

export function LessThanOrEqual<T>(value: T): ILessThanOrEqual<T> {
  return { operator: '<=', value };
}

export function $lte<T>(value: T): ILessThanOrEqual<T> {
  return { operator: '<=', value };
}

export function LessThan<T>(value: T): ILessThan<T> {
  return { operator: '<', value };
}

export function $lt<T>(value: T): ILessThan<T> {
  return { operator: '<', value };
}

export function GreaterThan<T>(value: T): IGreaterThan<T> {
  return { operator: '>', value };
}

export function $gt<T>(value: T): IGreaterThan<T> {
  return { operator: '>', value };
}

export function $gte<T>(value: T): {
  operator: string;
  value: T;
} {
  return { operator: '>=', value };
}

export function Equal(value): IEqualOperator {
  if (typeof value == 'object') {
    if (value.hasOwnProperty('operator') && value.hasOwnProperty('value')) {
      value = `${value['operator']} ${value['value']}`;
    }
  }
  return { operator: '=', value };
}

export function $eq(value): IEqualOperator {
  if (typeof value == 'object') {
    if (value.hasOwnProperty('operator') && value.hasOwnProperty('value')) {
      value = `${value['operator']} ${value['value']}`;
    }
  }
  return { operator: '=', value };
}

export function Between(value1: any, value2: any): IBetweenOperator {
  return { operator: 'BETWEEN', value1, value2 };
}

export function $bw(value1: any, value2: any): IBetweenOperator {
  return { operator: 'BETWEEN', value1, value2 };
}

export function In(...args): IInOperator {
  let _args = args;
  if (Array.isArray(args[0])) {
    _args = [...args.flat(1)];
  }
  return {
    operator: 'IN',
    value: `(${args.map((item) => `'${item}'`).join()})`,
  };
}

export function $in(...args): IInOperator {
  let _args = args;
  if (Array.isArray(args[0])) {
    _args = [...args.flat(1)];
  }

  return {
    operator: 'IN',
    value: `(${_args.map((item) => `'${item}'`).join()})`,
  };
}

export function All(...args): IAllOperator {
  let _args = args;
  if (Array.isArray(args[0])) {
    _args = [...args.flat(1)];
  }
  return {
    operator: 'ALL',
    value: `(${_args.map((item) => `'${item}'`).join()})`,
  };
}

export function $all(...args): IAllOperator {
  let _args = args;
  if (Array.isArray(args[0])) {
    _args = [...args.flat(1)];
  }
  return {
    operator: 'ALL',
    value: `(${_args.map((item) => `'${item}'`).join()})`,
  };
}

export function $any(...args): IAnyOperator {
  let _args = args;
  if (Array.isArray(args[0])) {
    _args = [...args.flat(1)];
  }

  return {
    operator: 'ANY',
    value: `(${_args.map((item) => `'${item}'`).join()})`,
  };
}

export const IsNull = (): IIsNull => ({ operator: 'IS', value: 'NULL' });

export const $isNull: IIsNull = {
  operator: 'IS',
  value: 'NULL',
};

export function Not(cb: { operator: string; value?: string }): INotOperator {
  let operatorRes = '';
  switch (cb.operator) {
    case 'IS':
      operatorRes = 'IS NOT';
      break;
    case '=':
      operatorRes = '!=';
      break;
    default:
      operatorRes = `NOT ${cb.operator}`;
  }
  return {
    operator: operatorRes,
    value: cb.value,
  };
}

export function $not(cb: { operator: string; value?: string }): INotOperator {
  let operatorRes = '';
  switch (cb.operator) {
    case 'IS':
      operatorRes = 'IS NOT';
      break;
    case '=':
      operatorRes = '!=';
      break;
    default:
      operatorRes = `NOT ${cb.operator}`;
  }
  return {
    operator: operatorRes,
    value: cb.value,
  };
}
