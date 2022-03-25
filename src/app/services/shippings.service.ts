import { Injectable, HttpException } from '@nestjs/common';
import { ShippingsEntity } from '../entities/shippings.entity';
import { ShippingRepository } from '../repositories/shippings.repository';
import { Table, JoinTable, SortBy } from '../../database/enums/index';

import { ShippingServiceRepository } from '../repositories/shippingsService.repository';
import { ShippingsServiceEntity } from '../entities/shippingsService.entity';
import { ShippingServiceDescriptionRepository } from '../repositories/shippingServiceDescription.repository';
import { ShippingsDescriptionEntity } from '../entities/shippingDescription.entity';
import { ShippingDescriptionRepository } from '../repositories/shippingDescription.repository';
import { ShippingsServiceDescriptionEntity } from '../entities/shippingServiceDescription.entity';
import { CreateShippingDto } from '../dto/shipping/create-shipping.dto';
import { ImagesLinksRepository } from '../repositories/imageLink.repository';
import { ImagesLinksEntity } from '../entities/imageLinkEntity';

import { ImagesEntity } from '../entities/image.entity';
import { ImagesRepository } from '../repositories/image.repository';
import { ImageObjectType } from '../../database/enums/tableFieldEnum/imageTypes.enum';
import { UpdateShippingDto } from '../dto/shipping/update-shipping.dto';
import { convertToMySQLDateTime } from 'src/utils/helper';
import { shippingJoiner, shippingServiceJoiner } from '../../utils/joinTable';
@Injectable()
export class ShippingService {
  private table = Table.SHIPPINGS;
  constructor(
    private shippingRepo: ShippingRepository<ShippingsEntity>,
    private shippingDescriptionRepo: ShippingDescriptionRepository<ShippingsDescriptionEntity>,
    private shippingServiceDescriptionRepo: ShippingServiceDescriptionRepository<ShippingsServiceDescriptionEntity>,
    private shippingServiceRepo: ShippingServiceRepository<ShippingsServiceEntity>,
    private imageLinkRepo: ImagesLinksRepository<ImagesLinksEntity>,
    private imageRepo: ImagesRepository<ImagesEntity>,
  ) {}

  async create(data: CreateShippingDto) {
    const shippingData = {
      ...new ShippingsEntity(),
      ...this.shippingRepo.setData(data),
      created_at: convertToMySQLDateTime(new Date(data.created_at)),
    };
    const newShipping = await this.shippingRepo.create(shippingData);
    let result = { ...newShipping };

    const shippingDescData = {
      ...new ShippingsDescriptionEntity(),
      ...this.shippingDescriptionRepo.setData(data),
      shipping_id: result.shipping_id,
    };
    const newShippingDesc = await this.shippingDescriptionRepo.create(
      shippingDescData,
    );
    result = { ...result, ...newShippingDesc };

    result = { ...result, services: [] };
    for (let service of data.services) {
      const serviceData = {
        ...new ShippingsServiceEntity(),
        ...this.shippingServiceRepo.setData(service),
        shipping_id: result.shipping_id,
      };
      const newService = await this.shippingServiceRepo.create(serviceData);

      const serviceDescData = {
        ...new ShippingsServiceDescriptionEntity(),
        ...this.shippingServiceDescriptionRepo.setData(service),
        service_id: newService.service_id,
      };
      const newServiceDesc = await this.shippingServiceDescriptionRepo.create(
        serviceDescData,
      );

      result = { ...result, services: [...result['services'], newServiceDesc] };
    }

    const shippingImage = await this.imageRepo.create({
      image_path: data.image_path,
    });
    const shippingImageLink = await this.imageLinkRepo.create({
      object_id: result.shipping_id,
      object_type: ImageObjectType.LOGO,
      image_id: shippingImage.image_id,
    });

    result = { ...result, image: { ...shippingImageLink, ...shippingImage } };

    return result;
  }

  async update(id: number, data: UpdateShippingDto) {
    const shipping = await this.shippingRepo.findOne({ shipping_id: id });
    if (!shipping) {
      throw new HttpException('Không tìm thấy đơn vị vận chuyển', 404);
    }

    if (data.created_at) {
      data['created_at'] = convertToMySQLDateTime(new Date(data['created_at']));
    }
    const shippingData = this.shippingRepo.setData(data);

    if (Object.entries(shippingData).length) {
      await this.shippingRepo.update({ shipping_id: id }, { ...shippingData });
    }

    const shippingDescData = this.shippingDescriptionRepo.setData(data);
    if (Object.entries(shippingDescData).length) {
      await this.shippingDescriptionRepo.update(
        { shipping_id: id },
        shippingDescData,
      );
    }

    if (data.services) {
      for (let service of data.services) {
        // Nếu có service_id -> check trong db -> update
        if (service.service_id) {
          const currentService = await this.shippingServiceRepo.findOne({
            service_id: service.service_id,
          });
          if (!currentService) {
            throw new HttpException('Không tìm thấy dịch vụ vận chuyển', 404);
          }
          const serviceData = await this.shippingServiceRepo.setData(service);
          if (Object.entries(serviceData).length) {
            await this.shippingServiceRepo.update(
              { service_id: service.service_id },
              { ...serviceData },
            );
          }

          const serviceDescData =
            await this.shippingServiceDescriptionRepo.setData(service);
          if (Object.entries(serviceDescData).length) {
            await this.shippingServiceDescriptionRepo.update(
              { service_id: service.service_id },
              serviceDescData,
            );
          }
          continue;
        }

        // Nếu ko có service_id -> tạo mới
        const newServiceData = {
          ...new ShippingsServiceEntity(),
          ...this.shippingServiceRepo.setData(service),
          shipping_id: id,
        };
        const newService = await this.shippingServiceRepo.create(
          newServiceData,
        );

        const newServiceDescData = {
          ...new ShippingsServiceDescriptionEntity(),
          ...this.shippingServiceDescriptionRepo.setData(service),
          service_id: newService.service_id,
        };
        await this.shippingServiceDescriptionRepo.create(newServiceDescData);
      }
    }

    if (data.image_path) {
      const imageLink = await this.imageLinkRepo.findOne({
        object_type: ImageObjectType.LOGO,
        object_id: id,
      });
      if (imageLink) {
        await this.imageRepo.update(
          { image_id: imageLink.image_id },
          { image_path: data.image_path },
        );
      }
    }
  }

  async getList(params) {
    let { page, limit } = params;
    page = +page || 1;
    limit = +limit || 20;
    const skip = (page - 1) * limit;
    const shippingsList = await this.shippingRepo.find({
      select: '*',
      join: shippingJoiner,
      orderBy: [
        { field: `${Table.SHIPPINGS}.shipping_id`, sortBy: SortBy.DESC },
      ],
      skip,
      limit,
    });

    if (shippingsList.length) {
      for (let shippingItem of shippingsList) {
        const shippingServices = await this.shippingServiceRepo.find({
          select: '*',
          join: shippingServiceJoiner,

          where: {
            [`${Table.SHIPPING_SERVICE}.shipping_id`]: shippingItem.shipping_id,
          },
        });

        shippingItem['services'] = shippingServices;

        shippingItem['image'] = null;
        const logoImageLink = await this.imageLinkRepo.findOne({
          object_type: ImageObjectType.LOGO,
          object_id: shippingItem.shipping_id,
        });

        if (logoImageLink) {
          const logoImage = await this.imageRepo.findOne({
            image_id: logoImageLink.image_id,
          });
          shippingItem['image'] = { ...logoImageLink, ...logoImage };
        }
      }
    }
    return shippingsList;
  }

  async get(id: number) {
    const shipping = await this.shippingRepo.findOne({
      select: '*',
      join: shippingJoiner,
      where: { [`${Table.SHIPPINGS}.shipping_id`]: id },
    });

    if (!shipping) {
      throw new HttpException('Không tìm thấy đơn vị vận chuyển', 404);
    }

    const shippingService = await this.shippingServiceRepo.find({
      select: '*',
      join: shippingServiceJoiner,
      where: { [`${Table.SHIPPING_SERVICE}.shipping_id`]: id },
    });

    const logoImageLink = await this.imageLinkRepo.findOne({
      object_id: shipping.shipping_id,
      object_type: ImageObjectType.LOGO,
    });
    shipping['image'] = null;
    if (logoImageLink) {
      const logoImage = await this.imageRepo.findOne({
        image_id: logoImageLink.image_id,
      });
      shipping['image'] = { ...logoImageLink, ...logoImage };
    }

    shipping['services'] = shippingService;
    return shipping;
  }
}
