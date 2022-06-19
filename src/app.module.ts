import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig, databaseConfig } from './config/index.config';
import { DatabaseModule } from './database/database.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { UserRepository } from './repository/user.repository';
import { OrderRepository } from './repository/order.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, databaseConfig],
    }),
    DatabaseModule,
  ],
  providers: [AppService, UserRepository, OrderRepository, String],
  controllers: [AppController],
})
export class AppModule {}
