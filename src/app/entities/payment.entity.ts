export class PaymentEntity {
    payment_id : number;
    company_id: number;
    usergroup_ids : string;
    position: number;
    status: string;
    template :string;
    processor_id: number;
    processor_params: string;
    a_surcharge: number;
    p_surcharge: number;
    tax_ids: string;
    localization:string;
    payment_category: string;
}

