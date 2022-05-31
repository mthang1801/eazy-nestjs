import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('message-audio')
export class AudioConsumer {
  @Process('message-audio-job')
  async solveAudioJob(job: Job<unknown>) {
    console.log('Audio Job ' + job.id);
    return {};
  }
}
