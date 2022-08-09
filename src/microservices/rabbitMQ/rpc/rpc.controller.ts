import { Controller, Get, Version } from '@nestjs/common';
import { BaseController } from '../../../base/base.controllers';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { exchange1 } from '../../../constants/queue.constant';
import { v4 as uuid } from 'uuid';
import { ApiTags } from '@nestjs/swagger';
@Controller()
@ApiTags('RabbitMQ RPC')
export class RpcController extends BaseController {
  constructor(private readonly amqpConnection: AmqpConnection) {
    super();
  }

  @Version('1')
  @Get('rpc')
  async getRpc() {
    return this.amqpConnection.request({
      exchange: exchange1,
      routingKey: 'rpc',
      payload: {
        key: 'rpc-key',
      },
    });
  }

  @Version('1')
  @Get('error-reply-rpc')
  async getErrorReplyRpc() {
    return this.amqpConnection.request({
      exchange: exchange1,
      routingKey: 'error-reply-rpc',
      payload: {
        key: 'rpc-key',
      },
      correlationId: uuid(),
    });
  }
}
