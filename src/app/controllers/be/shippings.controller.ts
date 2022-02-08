import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Put,
    Delete,
    UsePipes,
    ValidationPipe,
    UseGuards,
    Res
} from '@nestjs/common';
import { BaseController } from '../../../base/base.controllers';
import { IResponse } from '../../interfaces/response.interface';

import { } from '../../interfaces/response.interface';
import { AuthGuard } from '../../../middlewares/fe.auth';
import { ShippingService } from 'src/app/services/shippings.service';
import { shippingCreateDTO } from 'src/app/dto/shipping/shipping.dto';
@UseGuards(AuthGuard)
@Controller('/be/v1/shippings')
export class ShippingController extends BaseController {
    constructor(private ShippingService: ShippingService) {
        super();
    }


    @Get()
    async GetAll(@Res() res): Promise<IResponse> {
        const result = await this.ShippingService.GetAll();
        return this.responseSuccess(res, result);

    }
    @Get('/:id')
    async GetById(@Res() res,@Param('id') id): Promise<IResponse> {
        const result = await this.ShippingService.GetById(id);
        return this.responseSuccess(res, result);
        
    }
    @Post()
    async Create(@Res() res,@Body() body:shippingCreateDTO): Promise<IResponse> {
        const result = await this.ShippingService.Create(body);
        return this.responseSuccess(res, result);
    }
}
