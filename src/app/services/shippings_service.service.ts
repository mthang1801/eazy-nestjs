import { Injectable } from '@nestjs/common';
import { BaseService } from '../../base/base.service';
import { ShippingsService } from '../entities/shippings_service.entity';
import { ShippingServiceRepository } from '../repositories/shippings_service.repository';
import { Table } from '../../database/enums/index';

@Injectable()
export class ShippingServiceService extends BaseService<
ShippingsService,
ShippingServiceRepository<ShippingsService>
> {
    constructor(repository: ShippingServiceRepository<ShippingsService>, table: Table) {
        super(repository, table);
        this.table = Table.SHIPPING_SERVICE;
    }
    async Create(data) {
        return this.repository.create(data);
    }

}
