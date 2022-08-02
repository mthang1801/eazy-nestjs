import { Controller } from '@nestjs/common';
import { BaseController } from '../../../base/base.controllers';

@Controller('named-connection')
export class NamedConnectionController extends BaseController {}
