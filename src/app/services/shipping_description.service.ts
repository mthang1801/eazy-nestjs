import { Injectable } from '@nestjs/common';
import { BaseService } from '../../base/base.service';
import { ShippingsDescription } from '../entities/shipping_description.entity';
import { ShippingDescriptionRepository } from '../repositories/shipping_description.repository';
import { Table } from '../../database/enums/index';

@Injectable()
export class ShippingDescriptionService extends BaseService<
ShippingsDescription,
ShippingDescriptionRepository<ShippingsDescription>
> {
    constructor(repository: ShippingDescriptionRepository<ShippingsDescription>, table: Table) {
        super(repository, table);
        this.table = Table.SHIPPINGS_DESCRIPTION;
    }
    async Create(data) {
        return this.repository.create(data);
    }

}
