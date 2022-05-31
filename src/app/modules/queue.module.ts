import { Module, Global } from '@nestjs/common';

import { BullModule } from '@nestjs/bull';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { MessageProducerService } from '../microservices/queue/producers/message.producer';
import { MessageConsumer } from '../microservices/queue/consumers/message.consumer';
import { join } from 'path';
import { AudioProducerService } from '../microservices/queue/producers/audio.producer';
import { AudioConsumer } from '../microservices/queue/consumers/audio.consumer';
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
    BullModule.registerQueueAsync({
      name: 'message-audio',
    }),
  ],
  providers: [
    MessageProducerService,
    AudioConsumer,
    MessageConsumer,
    AudioProducerService,
  ],
  exports: [
    MessageProducerService,
    AudioConsumer,
    MessageConsumer,
    AudioProducerService,
  ],
})
export class QueueModule {}
