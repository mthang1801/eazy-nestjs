import { UserEntity } from '../entities/user.entity';
import { PaginatedDto } from '../dto/genneric/paginated.dto';
import { ApiPaginatedResponse } from './apiPaginatedResponse.swagger';
export const extraModels = [UserEntity, PaginatedDto, ApiPaginatedResponse];
