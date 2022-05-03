import { Module } from '@nestjs/common';
import { TradeinProgramRepository } from '../repositories/tradeinProgram.repository';
import { TradeinProgramService } from '../services/tradeinProgram.service';
import { TradeinProgramDetailRepository } from '../repositories/tradeinProgramDetail.repository';
import { TradeinProgramCriteriaRepository } from '../repositories/tradeinProgramCriteria.repository';
import { TradeinProgramController as TradeinProgramControllerBE } from '../controllers/be/v1/tradeinProgram.controller';
import { TradeinProgramController as TradeinProgramControllerFE } from '../controllers/fe/v1/tradeinProgram.controller';

@Module({
  providers: [
    TradeinProgramService,
    TradeinProgramRepository,
    TradeinProgramDetailRepository,
    TradeinProgramCriteriaRepository,
  ],
  exports: [
    TradeinProgramService,
    TradeinProgramRepository,
    TradeinProgramDetailRepository,
    TradeinProgramCriteriaRepository,
  ],
  controllers: [TradeinProgramControllerBE, TradeinProgramControllerFE],
})
export class TradeinProgramModule {}
