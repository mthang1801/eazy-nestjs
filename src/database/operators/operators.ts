import {
  processGetTextDataFromMysql,
  preprocessAddTextDataToMysql,
} from '../../base/base.helper';
export function Like<T>(value: T): {
  operator: string;
  value: T;
} {
  let _value = preprocessAddTextDataToMysql(value);

  return { operator: 'LIKE', value: _value };
}

export function $like<T>(value: T): {
  operator: string;
  value: T;
} {
  let _value = preprocessAddTextDataToMysql(value);

  return { operator: 'LIKE', value: _value };
}

export function LessThanOrEqual<T>(value: T): {
  operator: string;
  value: T;
} {
  return { operator: '<=', value };
}
export function $lte<T>(value: T): {
  operator: string;
  value: T;
} {
  return { operator: '<=', value };
}

export function LessThan<T>(value: T): {
  operator: string;
  value: T;
} {
  return { operator: '<', value };
}
export function $lt<T>(value: T): {
  operator: string;
  value: T;
} {
  return { operator: '<', value };
}

export function MoreThan(value): {
  operator: string;
  value;
} {
  return { operator: '>', value };
}

export function $gt(value): {
  operator: string;
  value;
} {
  return { operator: '>', value };
}

export function $gte<T>(value: T): {
  operator: string;
  value: T;
} {
  return { operator: '>=', value };
}

export function Equal(value): {
  operator: string;
  value;
} {
  if (typeof value == 'object') {
    if (value.hasOwnProperty('operator') && value.hasOwnProperty('value')) {
      value = `${value['operator']} ${value['value']}`;
    }
  }
  return { operator: '=', value };
}

export function $eq(value): {
  operator: string;
  value;
} {
  if (typeof value == 'object') {
    if (value.hasOwnProperty('operator') && value.hasOwnProperty('value')) {
      value = `${value['operator']} ${value['value']}`;
    }
  }
  return { operator: '=', value };
}

export function Between(
  value1,
  value2,
): {
  operator: string;
  value1;
  value2;
} {
  return { operator: 'BETWEEN', value1, value2 };
}

export function $bw(
  value1,
  value2,
): {
  operator: string;
  value1;
  value2;
} {
  return { operator: 'BETWEEN', value1, value2 };
}

export function In<T>(arr: T[]): {
  operator: string;
  value: string;
} {
  return {
    operator: 'IN',
    value: `(${arr.map((item) => `'${item}'`).join()})`,
  };
}
export function $in<T>(arr: T[]): {
  operator: string;
  value: string;
} {
  return {
    operator: 'IN',
    value: `(${arr.map((item) => `'${item}'`).join()})`,
  };
}

export function All<T>(arr: T[]): {
  operator: string;
  value: string;
} {
  return {
    operator: 'ALL',
    value: `(${arr.map((item) => `'${item}'`).join()})`,
  };
}

export function $all<T>(arr: T[]): {
  operator: string;
  value: string;
} {
  return {
    operator: 'ALL',
    value: `(${arr.map((item) => `'${item}'`).join()})`,
  };
}

export function Any<T>(arr: T[]): {
  operator: string;
  value: T[];
} {
  return { operator: 'ANY', value: arr };
}

export function $any<T>(arr: T[]): {
  operator: string;
  value: T[];
} {
  return { operator: 'ANY', value: arr };
}

export function IsNull() {
  return { operator: 'IS', value: 'NULL' };
}

export function $isNull() {
  return { operator: 'IS', value: 'NULL' };
}

export function Not(cb: { operator: string; value?: string }): {
  operator: string;
  value?: string;
} {
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
export function $not(cb: { operator: string; value?: string }): {
  operator: string;
  value?: string;
} {
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
