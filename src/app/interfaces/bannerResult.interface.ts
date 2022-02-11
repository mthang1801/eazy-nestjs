import { IImages } from 'src/base/interfaces/image.interface';
import { IBanner } from './banner.interface';
import { IBannerDescription } from './bannerDescription.interface';

export interface IBannerResult extends IBanner, IBannerDescription {
  images?: IImages[];
}
