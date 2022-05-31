import { Module, Global } from '@nestjs/common';

import { BullModule } from '@nestjs/bull';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { MessageProducerService } from '../microservices/queue/producers/message.producer';
import { MessageConsumer } from '../microservices/queue/consumers/message.consumer';
@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('redisHost'),
          port: configService.get<number>('redisPort'),
          password: configService.get<string>('redisPass'),
          db: 6,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueueAsync({
      name: 'message-queue',
    }),
  ],
  providers: [MessageProducerService, MessageConsumer],
  exports: [MessageProducerService, MessageConsumer],
})
export class QueueModule {}
