import { Injectable, HttpException } from '@nestjs/common';
import { TestRepository } from '../repositories/test.repository';
import { TestEntity } from '../entities/test.entity';
import { CreateTestDto } from '../dto/test/create-test.dto';
import { Table } from '../../database/enums/tables.enum';
import { UpdateTestDto } from '../dto/test/update-test.dto';

@Injectable()
export class TestService{
    constructor(
        private testRepo: TestRepository<TestEntity>
    ) {}

    async Testcreate(data: CreateTestDto){
        const testData = {
            ...new TestEntity(),
            ...this.testRepo.setData(data),
        };

        await this.testRepo.create(
            testData,
        );
    }
    
    async Testupdate(id: number, data: UpdateTestDto) {
        const store = await this.testRepo.findOne({ id });
        if (!store) {
          throw new HttpException('Không tìm thấy test.', 404);
        }
        else {
            let newTestData = {
                ...new TestEntity(),
                ...this.testRepo.setData(data),
                id,
            };
            console.log(newTestData);
            await this.testRepo.update({ id }, newTestData);
        }
    }

    async getAll() {
        return this.testRepo.find({
          select: ['*'],
        });
    }

    async getById(id: number) {
        return this.testRepo.findOne({
          select: '*',
          where: {
            [`${Table.TEST}.id`]: id,
          },
        });
    }
}