import { Global, Module } from '@nestjs/common';
import { UploadController } from '../controllers/common/upload.controller';
import { UploadService } from '../services/upload.services';

@Global()
@Module({
  providers: [UploadService],
  exports: [UploadService],
  controllers: [UploadController],
})
export class UploadModule {}
