import { Module, Global } from '@nestjs/common';
import { UploadController } from '../controllers/common/upload.controller';
import { UploadService } from '../services/upload.service';

@Global()
@Module({
  providers: [UploadService],
  exports: [UploadService],
  controllers: [UploadController],
})
export class UploadModule {}
