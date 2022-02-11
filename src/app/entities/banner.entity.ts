import { convertToMySQLDateTime } from "src/utils/helper";

export class BannerEntity {
    banner_id : number;
    status: string ='A';
    type : string ='G';
    target: string='B';
    localization: string='';
    created_at: string = convertToMySQLDateTime();
    position: number=0;
}
