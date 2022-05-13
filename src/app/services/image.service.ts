import { Injectable } from '@nestjs/common';
import { ImagesEntity } from '../entities/image.entity';
import { ImagesRepository } from '../repositories/image.repository';
import { Table, JoinTable } from '../../database/enums/index';
import { ImagesLinksRepository } from '../repositories/imageLink.repository';
import { ImagesLinksEntity } from '../entities/imageLinkEntity';
import { ImageType } from '../../database/enums/tableFieldEnum/imageTypes.enum';
@Injectable()
export class ImagesService {
  constructor(
    private repository: ImagesRepository<ImagesEntity>,

    private imageLinkRepo: ImagesLinksRepository<ImagesLinksEntity>,
  ) {}
  async Create(data, object_id) {
    const imageTableData = {
      ...this.repository.setData(data),
    };
    let _images = await this.repository.create(imageTableData);
    // ===========================|Add to ddve_images_links|=============================
    const imageLinkTableData = {
      object_id: object_id,
      object_type: 'banners',
      image_id: _images.image_id,
      ...this.imageLinkRepo.setData(data),
    };

    let _images_link = await this.imageLinkRepo.create(imageLinkTableData);
  }
  async Update(data, banner_id, images_id) {
    const imageTableData = {
      ...this.repository.setData(data),
    };
    let _images = await this.repository.update(images_id, imageTableData);
    // ===========================|Add to ddve_images_links|=============================
    const imageLinkTableData = {
      object_id: banner_id,
      object_type: 'banners',
      image_id: images_id,
      ...this.imageLinkRepo.setData(data),
    };

    let _images_link = await this.imageLinkRepo.update(
      images_id,
      imageLinkTableData,
      true,
    );
  }
  async Delete(banner_id, images_id) {
    let count = await this.imageLinkRepo.find({
      where: { object_id: banner_id, images_id: images_id },
    });
    if (count.length <= 0) return `Khong ton tai`;
    let _image = this.repository.delete(images_id);
    let _image_link = this.imageLinkRepo.delete(images_id);
    Promise.all([_image, _image_link]);
  }
  async getAllIamgesByBannerId(id) {
    const string = `${Table.IMAGE_LINK}.object_id`;

    const image = await this.imageLinkRepo.find({
      select: ['*'],
      join: {
        [JoinTable.join]: {
          ddv_images: {
            fieldJoin: `${Table.IMAGE}.image_id`,
            rootJoin: `${Table.IMAGE_LINK}.image_id`,
          },
        },
      },
      where: { [string]: id },

      skip: 0,
      limit: 30,
    });
    return image;
  }
  async GetImage() {
    return this.imageLinkRepo.find({
      select: ['*'],
      join: {
        [JoinTable.join]: {
          ddv_images: {
            fieldJoin: 'image_id',
            rootJoin: `${Table.IMAGE_LINK}.image_id`,
          },
        },
      },
      skip: 0,
      limit: 99999,
    });
  }
  async GetImageById(id) {
    const string1 = `${Table.IMAGE_LINK}.object_id`;

    return this.imageLinkRepo.find({
      select: ['*'],
      where: { [string1]: id },

      join: {
        [JoinTable.join]: {
          ddv_images: {
            fieldJoin: 'image_id',
            rootJoin: `${Table.IMAGE_LINK}.image_id`,
          },
        },
      },
      skip: 0,
      limit: 30,
    });
  }
}
