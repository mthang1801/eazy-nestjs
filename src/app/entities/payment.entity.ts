export class Payment {
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
export class paymentDescriptions {
    payment_id : number;
    description: string;
    payment: string;
    instructions:string;
    surcharge_tittle : string;
    lang_code:string;

}
export class orderStatusData {
    status_id : number;
    value: string;
    param : string;


}