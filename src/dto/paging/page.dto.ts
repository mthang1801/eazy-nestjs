import { ApiProperty } from '@nestjs/swagger';

export class PageDto {
  @ApiProperty({ type: Number, example: 1 })
  currentPage: number;

  @ApiProperty({ type: Number, example: 10 })
  limit: number;

  @ApiProperty({ type: Number, example: 50 })
  total: number;
}

export class PaginatedDto<T> {
  @ApiProperty()
  page: PageDto;

  @ApiProperty()
  data: T[];
}
