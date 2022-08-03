import { Module } from '@nestjs/common';
import { NamedConnectionService } from './named-connection.service';
import { NamedConnectionController } from './named-connection.controller';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';
import { exchange2, CONNECTION_NAME } from '../../../constants/queue.constant';

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: (config: ConfigService) => ({
        name: CONNECTION_NAME,
        exchanges: [
          {
            name: exchange2,
            type: 'topic',
          },
        ],
        uri: `amqp://${config.get<string>('rabbitUser')}:${config.get<string>(
          'rabbitPass',
        )}@${config.get<string>('rabbitHost')}:${config.get<number>(
          'rabbitPort',
        )}`,
        connectionInitOptions: { wait: true, reject: true, timeout: 5000 },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [NamedConnectionService],
  controllers: [NamedConnectionController],
})
export class NamedConnectionModule {}
