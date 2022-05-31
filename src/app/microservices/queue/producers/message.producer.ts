import {
  InjectQueue,
  OnGlobalQueueCompleted,
  OnGlobalQueueProgress,
  OnQueueActive,
  OnQueueProgress,
} from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue, Job } from 'bull';
import * as _ from 'lodash';

@Injectable()
export class MessageProducerService {
  constructor(@InjectQueue('message-queue') private queue: Queue) {}

  async sendMessage(data) {
    for (let i = 0; i < 15; i++) {
      await this.queue.add('message-job', data);
    }
  }
}
