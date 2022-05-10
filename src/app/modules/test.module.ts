import { Module } from "@nestjs/common";
import { TestService } from '../services/test.service';
import { TestRepository } from '../repositories/test.repository';
import { TestController } from '../controllers/be/v1/test.controller';

@Module({
    providers: [
        TestService,
        TestRepository,
    ],
    controllers: [
        TestController,
    ]
})

export class TestModule{}