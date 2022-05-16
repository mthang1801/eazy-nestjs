import { IsNotEmpty } from 'class-validator';
export class UpdatePageDetailStatus {
  @IsNotEmpty()
  status: string;
}
