import { Injectable } from '@nestjs/common';
import { BaseService } from '../../base/base.service';
import { ShippingsServiceDescription } from '../entities/shipping_service_description.entity';
import { ShippingServiceDescriptionRepository } from '../repositories/shipping_service_description.repository';
import { Table } from '../../database/enums/index';

@Injectable()
export class ShippingServiceDescriptionService extends BaseService<
ShippingsServiceDescription,
ShippingServiceDescriptionRepository<ShippingsServiceDescription>
> {
    constructor(repository: ShippingServiceDescriptionRepository<ShippingsServiceDescription>, table: Table) {
        super(repository, table);
        this.table = Table.SHIPPING_SERVICE_DESCRIPTION;
    }
    async Create(data) {
        return this.repository.create(data);
    }

}
