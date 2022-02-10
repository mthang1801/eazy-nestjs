export class PaymentEntity {
    payment_id : number;
    company_id: number=0;
    usergroup_ids : string='';
    position: number=0;
    status: string='';
    template :string='';
    processor_id: number=0;
    processor_params: string='';
    a_surcharge: number=0;
    p_surcharge: number=0;
    tax_ids: string='';
    localization:string='';
    payment_category: string='';
}

