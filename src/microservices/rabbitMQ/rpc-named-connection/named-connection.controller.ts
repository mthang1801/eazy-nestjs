import { Controller, Get } from '@nestjs/common';
import { BaseController } from '../../../base/base.controllers';
import { AmqpConnectionManager, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { exchange2, CONNECTION_NAME } from '../../../constants/queue.constant';
import { v4 as uuid } from 'uuid';
@Controller('named-connection')
export class NamedConnectionController extends BaseController {
  constructor(private readonly amqpConnManager: AmqpConnectionManager) {
    super();
  }

  get amqpConn() {
    return this.amqpConnManager.getConnection(CONNECTION_NAME);
  }

  @Get('rpc')
  getRpc() {
    return this.amqpConn.request({
      exchange: exchange2,
      routingKey: 'rpc-2',
      payload: {
        data: {
          status: 'success',
          statusCode: 200,
        },
        timestamp: new Date().toLocaleString('vn'),
      },
    });
  }

  @Get('reply-error-rpc-2')
  async getRpcError() {
    return this.amqpConn.request({
      exchange: exchange2,
      routingKey: 'reply-error-rpc-2',
      payload: {
        data: {
          msg: 'test error',
          statusCode: 500,
        },
        timestamp: new Date().toLocaleString('vn'),
      },
      correlationId: uuid(),
    });
  }

  @Get('non-json-rpc-2')
  getNonJSONRpc2() {
    return this.amqpConn.request({
      exchange: exchange2,
      routingKey: 'non-json-rpc-2',
      payload: {
        data: {
          msg: 'test Non JSON',
          statusCode: 200,
        },
        timestamp: new Date().toLocaleString('vn'),
      },
      correlationId: uuid(),
    });
  }
}
