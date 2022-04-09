import { Controller, Get } from '@nestjs/common';
import { citiesData } from '../../../constants/cities';

@Controller('queue/v1')
export class QueueController {
  @Get()
  async importService() {
    console.log(citiesData);
  }
}
