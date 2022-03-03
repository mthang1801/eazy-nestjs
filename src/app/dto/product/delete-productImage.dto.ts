import { ArrayNotEmpty } from 'class-validator';

export class DeleteProductImageDto {
  @ArrayNotEmpty()
  images_id: number[];
}
