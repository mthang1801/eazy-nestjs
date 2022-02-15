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
  value: T[];
} {
  return { operator: 'IN', value: arr };
}

export function Any<T>(arr: T[]): {
  operator: string;
  value: T[];
} {
  return { operator: 'ANY', value: arr };
}

export function IsNull<T>(): {
  operator: string;
} {
  return { operator: 'ISNULL' };
}

export function Not<T>(cb: { operator: string; value?: string }): {
  operator: string;
  value?: string;
} {
  return {
    operator: cb.operator === '=' ? `!=` : `NOT ${cb.operator}`,
    value: cb.value,
  };
}
