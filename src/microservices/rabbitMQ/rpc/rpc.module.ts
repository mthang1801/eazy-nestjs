import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';
import { exchange1 } from '../../../constants/queue.constant';
import { RpcService } from './rpc.service';
import { RpcController } from './rpc.controller';
@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: (config: ConfigService) => ({
        exchanges: [
          {
            name: exchange1,
            type: 'topic',
          },
        ],
        uri: `amqp://guest:guest@${config.get<string>(
          'rabbitHost',
        )}:${config.get<number>('rabbitPort')}`,
        prefetchCount: 1,
        connectionInitOptions: { wait: true, reject: true, timeout: 5000 },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [RpcService],
  providers: [RpcService],
  controllers: [RpcController],
})
export class RpcModulle {}
