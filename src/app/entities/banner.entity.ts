export class BannerEntity {
  banner_id: number;
  status: string = 'A';
  type: string = 'G';
  target: string = 'B';
  localization: string = '';
  created_at: Date = new Date();
  position: number = 0;
}
