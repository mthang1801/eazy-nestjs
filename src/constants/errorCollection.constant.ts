export class ErrorCollection {
  private _name = '';
  private _code = 500;

  constructor() {}

  querySyntax() {
    this._name = 'Cú pháp truy vấn không hợp lệ';
    this._code = 400;
    return this.responseError();
  }

  public responseError() {
    return {
      message: this._name,
      statusCode: this._code,
    };
  }
}
