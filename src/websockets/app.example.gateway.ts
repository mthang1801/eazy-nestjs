import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { Socket } from 'dgram';

@WebSocketGateway({ namespace: 'chat' })
export class AppExampleGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger = new Logger('AppGateway');

  @WebSocketServer() wss: Server;

  afterInit(server: any) {
    this.logger.log('App Ws initialized...');
  }

  handleConnection(client: any, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('msgToServer')
  handleMessage(client, payload: any) {
    this.logger.log(`Message received for ${client.id}`);
    this.logger.log(payload);
    this.wss.emit('msgToClient', payload);
    return { event: 'msgToClient', data: payload };
  }
}
