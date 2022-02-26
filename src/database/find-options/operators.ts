export function Like<T>(value: T): {
  operator: string;
  value: T;
} {
  return { operator: 'LIKE', value };
}

export function LessThanOrEqual<T>(value: T): {
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

export function MoreThan<T>(value: T): {
  operator: string;
  value: T;
} {
  return { operator: '>', value };
}

export function MoreThanOrEqual<T>(value: T): {
  operator: string;
  value: T;
} {
  return { operator: '>=', value };
}

export function Equal<T>(value: T): {
  operator: string;
  value: T;
} {
  return { operator: '=', value };
}

export function Between<T>(
  value1: T,
  value2: T,
): {
  operator: string;
  value1: T;
  value2: T;
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

export function Any<T>(arr: T[]): {
  operator: string;
  value: T[];
} {
  return { operator: 'ANY', value: arr };
}

export function IsNull() {
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
      operatorRes = '!==';
      break;
    default:
      operatorRes = `NOT ${cb.operator}`;
  }
  return {
    operator: operatorRes,
    value: cb.value,
  };
}
