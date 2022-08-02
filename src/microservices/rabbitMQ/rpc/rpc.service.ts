import {
  MessageHandlerErrorBehavior,
  RabbitRPC,
} from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { exchange1 } from '../../../constants/queue.constant';
import { ReplyErrorCallback } from './reply.error.callback';

@Injectable()
export class RpcService {
  @RabbitRPC({
    routingKey: 'rpc',
    exchange: exchange1,
    queue: 'rpc',
  })
  rpc(message: object) {
    return {
      echo: message,
    };
  }

  @RabbitRPC({
    routingKey: 'error-reply-rpc',
    exchange: exchange1,
    queue: 'error-reply-rpc',
    errorBehavior: MessageHandlerErrorBehavior.ACK,
    errorHandler: ReplyErrorCallback,
  })
  errorReplyRpc(message: object) {
    throw new RpcException(message);
  }
}
