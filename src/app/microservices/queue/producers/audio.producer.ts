import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AudioProducerService {
  constructor(@InjectQueue('message-audio') private queue: Queue) {}

  async sendAudio(data) {
    await this.queue.add('message-audio-job', data);
  }
}
