import { Injectable, HttpException } from '@nestjs/common';
import { Table } from 'src/database/enums';
import { CreateStickerDto } from '../dto/sticker/create-sticker.dto';
import { StickerEntity } from '../entities/sticker.entity';
import { StickerRepository } from '../repositories/sticker.repository';
import { convertToMySQLDateTime } from '../../utils/helper';
import * as moment from 'moment';
import { stickerFilterSearch } from 'src/utils/tableConditioner';
import { UpdateStickerDto } from '../dto/sticker/update-sticker.dto';

@Injectable()
export class StickerService {
  constructor(private stickerRepo: StickerRepository<StickerEntity>) {}

  async create(data: CreateStickerDto) {
    const stickerData = {
      ...new StickerEntity(),
      ...this.stickerRepo.setData(data),
    };

    await this.stickerRepo.create(stickerData);
  }

  async getList(params) {
    let { page, limit, search, created_at, status } = params;

    let filterConditions = {};
    if (created_at) {
      filterConditions[`${Table.STICKER}.created_at`] =
        moment(created_at).format('YYYY-MM-DD');
    }
    if (status) {
      filterConditions[`${Table.STICKER}.status`] = status;
    }

    let stickersList = await this.stickerRepo.find({
      select: '*',
      where: stickerFilterSearch(search, filterConditions),
    });

    let count = await this.stickerRepo.find({
      select: `COUNT(DISTINCT(${Table.STICKER}.sticker_id)) as total`,
      where: stickerFilterSearch(search, filterConditions),
    });

    return {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count[0].total,
      },
      stickers: stickersList,
    };
  }

  async get(sticker_id) {
    return this.stickerRepo.findById(sticker_id);
  }

  async update(sticker_id, data: UpdateStickerDto) {
    const sticker = await this.stickerRepo.findById(sticker_id);
    if (!sticker) {
      throw new HttpException('Không tìm thấy sticker', 404);
    }

    const stickerUpdated = {
      ...this.stickerRepo.setData(data),
      updated_at: convertToMySQLDateTime(),
    };
    await this.stickerRepo.update({ sticker_id }, stickerUpdated);
  }
}
