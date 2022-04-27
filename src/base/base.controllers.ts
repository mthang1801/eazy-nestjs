import { IResponse } from '../app/interfaces/response.interface';
export class BaseController {
  private message: string | string[] = '';
  private data: any = null;
  private res: any;
  private statusCode: number = 200;

  constructor() {}

  getStatusCode() {
    return this.statusCode;
  }
  setStatusCode(code: number) {
    return (this.statusCode = code);
  }

  /**
   * @param message string
   * @returns IResponseError
   */
  private responseWithError(): IResponse {
    const data = {
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
      timestamp: new Date().toLocaleString(),
    };
    return this.res.status(this.statusCode).send(data);
  }

  /**
   * @param data any
   * @returns IResponseError
   */
  private respond(): IResponse {
    let dataResponse = {};
    if (!this.data) {
      dataResponse = {
        statusCode: this.statusCode,
        data: null,
        message: this.message,
        timestamp: new Date().toLocaleString(),
      };
    } else {
      dataResponse = {
        statusCode: this.statusCode,
        data: typeof this.data !== 'object' ? { data: this.data } : this.data,
        message: this.message,
        timestamp: new Date().toLocaleString(),
      };
    }

    return this.res.status(this.statusCode).send(dataResponse);
  }

  /**
   * @description  400 - The request was invalid.
   * @param res Response
   * @param message string
   * @returns
   */
  public respondBadRequest(
    res,
    message: string = 'The request was invalid.',
  ): IResponse {
    this.setStatusCode(400);
    this.message = message;
    this.res = res;
    return this.responseWithError();
  }

  /**
   * @description  Response 404. Not Found
   * @param res Response
   * @param message string
   * @returns
   */
  public responseNotFound(res, message: string = 'Not Found'): IResponse {
    this.setStatusCode(404);
    this.message = message;
    this.res = res;
    return this.responseWithError();
  }

  public responseInternalError(res, message: string = 'Internal Server Error') {
    this.setStatusCode(500);
    this.message = message;
    this.res = res;
    return this.responseWithError();
  }

  /**
   * @param res Response
   * @param data any
   */
  public responseCreated(res, data = null): IResponse {
    this.setStatusCode(201);
    this.data = data;
    this.res = res;
    return this.respond();
  }

  /**
   * @param res
   * @returns void
   */
  public responseNoContent(res): IResponse {
    this.setStatusCode(204);
    this.message = '';
    this.data = {};
    this.res = res;
    return this.respond();
  }

  /**
   * @description return result when request with PUT, GET, DELETE method success
   * @param res
   * @param data
   * @returns object with code and data
   */
  public responseSuccess(
    res,
    data = null,
    message: string = 'Thành công.',
  ): IResponse {
    this.res = res;
    this.setStatusCode(200);
    this.message = message;
    if (typeof data !== 'object') {
      this.data = { data };
    }
    this.data = data;
    return this.respond();
  }
  /**
   * @description return result when request with DELETE method success without content, data
   * @param res
   * @param data
   * @returns object with code and data
   */
  public responseSuccessNoContent(res): IResponse {
    this.res = res;
    this.setStatusCode(204);
    this.data = null;
    return this.respond();
  }

  /**
   *
   * @param res Response
   * @param satatusCode number
   * @param message string | string[]
   * @returns success : false, statusCode and message
   */
  public responseFail(
    res,
    satatusCode: number = 500,
    message: string | string[] = 'Thất bại.',
  ) {
    this.res = res;
    this.setStatusCode(satatusCode);
    this.message = message;
    return this.respond();
  }

  public optionalResponse(
    res,
    statusCode = 200,
    message: string = '',
    data: any = null,
  ) {
    this.res = res;
    this.setStatusCode(statusCode);
    this.data = data;
    this.message = message;
    return this.respond();
  }
}
