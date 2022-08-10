import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'dgram';
import { BaseController } from '../base/base.controllers';

@WebSocketGateway(80, { namespace: 'example', cors: { origin: '*' } })
export class ExampleGateway {}
