import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('message-queue')
export class MessageConsumer {
  @Process('message-job')
  async solveMessageJob(job: Job<unknown>) {
    let progress = 0;
    for (let i = 0; i < 100; i++) {
      console.log(job.data);
      progress++;
      await job.progress(progress);
    }
  }
}
