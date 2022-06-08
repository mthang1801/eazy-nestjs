import { Controller, Get } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  EventPattern,
} from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('create-order')
  async messageCreateOrder(
    @Payload() data: Record<string, object>,
    @Ctx() ctx,
  ): Promise<any> {
    console.log(data);
    return data;
  }
}
