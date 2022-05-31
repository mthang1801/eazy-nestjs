import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('message-queue')
export class MessageConsumer {
  @Process('message-job')
  async solveMessageJob(job: Job<unknown>) {
    console.log('Message Job ' + job.id);
    return {};
  }
}
