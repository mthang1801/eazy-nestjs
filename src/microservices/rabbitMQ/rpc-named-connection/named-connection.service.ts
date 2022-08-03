import {
  MessageHandlerErrorBehavior,
  RabbitRPC,
} from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { exchange2, CONNECTION_NAME } from '../../../constants/queue.constant';
import { RpcException } from '@nestjs/microservices';
import { replyRpcNamedConnectionCallbackError } from './replyRpcNamedConnection.error.callback';

@Injectable()
export class NamedConnectionService {
  @RabbitRPC({
    exchange: exchange2,
    routingKey: 'rpc-2',
    queue: 'rpc-2',
  })
  async rpc(message: any = {}) {
    return message;
  }

  @RabbitRPC({
    connection: CONNECTION_NAME,
    exchange: exchange2,
    routingKey: 'reply-error-rpc-2',
    queue: 'reply-error-rpc-2',
    errorBehavior: MessageHandlerErrorBehavior.NACK,
    errorHandler: replyRpcNamedConnectionCallbackError,
  })
  errorReplyRpc(message: any = {}) {
    throw new RpcException(message);
  }

  @RabbitRPC({
    exchange: exchange2,
    routingKey: 'non-json-rpc-2',
    queue: 'non-json-rpc-2',
    allowNonJsonMessages: true,
  })
  async getNonJSONRpc2(message: any) {
    return {
      data: message,
    };
  }
}
