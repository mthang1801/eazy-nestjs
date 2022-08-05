export class ErrorCollection {
  private _name = '';
  private _code = 500;

  constructor() {}

  querySyntax() {
    this._name = 'Cú pháp truy vấn không hợp lệ';
    this._code = 400;
    return this.responseError();
  }

  internalServer() {
    this._name = 'Hệ thống gặp sự cố.';
    this._code = 500;
    return this.responseError();
  }

  TokenExpiredError() {
    this._name = 'Phiên đăng nhập đã hết hạn.';
    this._code = 408;
    return this.responseError();
  }

  ETIMEDOUT() {
    this._name = 'Thời gian truy vấn đã hết.';
    this._code = 504;
    return this.responseError();
  }

  public responseError() {
    return {
      message: this._name,
      statusCode: this._code,
    };
  }
}
