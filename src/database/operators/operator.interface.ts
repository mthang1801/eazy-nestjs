export interface IAllOperator {
  operator: 'ALL';
  value: string;
}

export interface IAllOperator {
  operator: 'ALL';
  value: string;
}

export interface IInOperator {
  operator: 'IN';
  value: string;
}

export interface IBetweenOperator {
  operator: string;
  value1: any;
  value2: any;
}

export interface IAnyOperator {
  operator: string;
  value: any;
}

export interface ILikeOperator<T> {
  operator: string;
  value: T;
}

export interface ILessThanOrEqual<T> {
  operator: string;
  value: T;
}

export interface ILessThan<T> {
  operator: string;
  value: T;
}

export interface IGreaterThan<T> {
  operator: string;
  value: T;
}

export interface IEqualOperator {
  operator: string;
  value: any;
}

export interface INotOperator {
  operator: string;
  value?: string;
}
