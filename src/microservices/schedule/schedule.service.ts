import { Injectable } from '@nestjs/common';
import { SchedulerRegistry, Timeout } from '@nestjs/schedule';

@Injectable()
export class ScheduleService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  async addInterval(
    name: string,
    functs: any | any[],
    milliseconds: number,
  ): Promise<void> {
    let interval: any = this.getInterval(name);

    if (interval) {
      this.deleteInterval(name);
    }

    const cb = async () => {
      if (Array.isArray(functs)) {
        await Promise.all(functs.map((item) => item()));
      } else {
        await functs;
      }
    };

    interval = setInterval(cb, milliseconds);
    this.schedulerRegistry.addInterval(name, interval);
  }

  deleteInterval(name): void {
    this.schedulerRegistry.deleteInterval(name);
  }

  getIntervals(): string[] {
    return this.schedulerRegistry.getIntervals().map((key) => key);
  }

  getInterval(name): string {
    let intervals = this.getIntervals();
    return intervals.find((interval) => interval === name);
  }

  addTimeout(
    name: string,
    functs: any | any[],
    milliseconds: number,
  ): Promise<void> {
    let timeout: any = this.getTimeout(name);

    if (timeout) {
      this.deleteTimeout(timeout);
    }

    const cb = async () => {
      if (Array.isArray(functs)) {
        await Promise.all(functs.map((item) => item()));
      } else {
        await functs;
      }
    };

    timeout = setTimeout(cb, milliseconds);
    this.schedulerRegistry.addTimeout(name, timeout);
    return;
  }

  getTimeouts(): string[] {
    return this.schedulerRegistry.getTimeouts().map((key) => key);
  }

  getTimeout(name: string): string {
    return this.getTimeouts().find((timeout) => timeout === name);
  }

  deleteTimeout(name: string) {
    this.schedulerRegistry.deleteTimeout(name);
  }
}
