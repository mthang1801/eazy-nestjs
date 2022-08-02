import { Module } from '@nestjs/common';
import { NamedConnectionService } from './named-connection.service';
import { NamedConnectionController } from './named-connection.controller';

@Module({
  providers: [NamedConnectionService],
  controllers: [NamedConnectionController],
})
export class NamedConnectionModule {}
