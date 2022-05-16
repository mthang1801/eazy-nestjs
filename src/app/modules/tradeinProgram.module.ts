import { TradeinProgramController } from './../controllers/fe/v1/tradeinProgram.controller';
import { Module } from '@nestjs/common';
import { TradeinProgramRepository } from '../repositories/tradeinProgram.repository';
import { TradeinProgramService } from '../services/tradeinProgram.service';
import { TradeinProgramDetailRepository } from '../repositories/tradeinProgramDetail.repository';
import { TradeinProgramCriteriaRepository } from '../repositories/tradeinProgramCriteria.repository';
import { TradeinProgramController as TradeinProgramControllerBE } from '../controllers/be/v1/tradeinProgram.controller';
import { TradeinProgramController as TradeinProgramControllerFE } from '../controllers/fe/v1/tradeinProgram.controller';
import { TradeinProgramCriteriaDetailRepository } from '../repositories/tradeinProgramCriteriaDetail.repository';
import { ProductsModule } from './products.module';
import { ValuationBillRepository } from '../repositories/valuationBill.repository';
import { ValuationBillCriteriaDetailRepository } from '../repositories/valuationBillCriteriaDetail.repository';
import { UsersModule } from './users.module';
import { TradeinProgramControllerItg } from '../controllers/integration/v1/tradeinProgram.controller';
import { TradeinOldReceiptRepository } from '../repositories/tradeinOldReceipt.repository';
import { TradeinOldReceiptDetailRepository } from '../repositories/tradeinOldReceiptDetail.repository';
import { CustomerService } from '../services/customer.service';

@Module({
  imports: [ProductsModule, UsersModule],
  providers: [
    TradeinProgramService,
    TradeinProgramRepository,
    TradeinProgramDetailRepository,
    TradeinProgramCriteriaRepository,
    TradeinProgramCriteriaDetailRepository,
    ValuationBillRepository,
    ValuationBillCriteriaDetailRepository,
    TradeinOldReceiptRepository,
    TradeinOldReceiptDetailRepository,
    CustomerService,
  ],
  exports: [
    TradeinProgramService,
    TradeinProgramRepository,
    TradeinProgramDetailRepository,
    TradeinProgramCriteriaRepository,
    TradeinProgramCriteriaDetailRepository,
    ValuationBillRepository,
    ValuationBillCriteriaDetailRepository,
    TradeinOldReceiptRepository,
    TradeinOldReceiptDetailRepository,
  ],
  controllers: [
    TradeinProgramControllerBE,
    TradeinProgramControllerFE,
    TradeinProgramControllerItg,
    TradeinProgramController,
  ],
})
export class TradeinProgramModule {}
