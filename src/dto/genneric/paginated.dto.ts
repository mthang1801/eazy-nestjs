import { ApiProperty } from '@nestjs/swagger';
export class PagingDto {
  @ApiProperty({ type: Number, default: 1 })
  currentPage: number;

  @ApiProperty({ type: Number, default: 10 })
  limit: number;

  @ApiProperty({ type: Number, default: 1000 })
  total: number;
}

export class PaginatedDto<TData> {
  @ApiProperty()
  paging: PagingDto;

  data: TData[];
}
