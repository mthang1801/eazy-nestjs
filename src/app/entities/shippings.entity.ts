export class ShippingsEntity {
    shipping_id : number;
    company_id: number=0;
    destination : string='';
    min_weight: number=0;
    max_weight: number=0;
    usergroup_ids: string='';
    rate_calculation: string='';
    service_id :number=0;
    service_params:string='';
    localization:string='';
    tax_ids:string='';
    position:number=0;
    status:string='';
    free_shipping:string='';
    is_address_required:string='';
}