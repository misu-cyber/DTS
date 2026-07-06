export type addDocument ={
    control_no: string,
    document_code: string;
    document_title: string;
    document_type: number;
    category: number;
    office: number;
    remarks: string;
    confidential: boolean;
    sequence_no: number;
    date: string;
    created_by: number;
}

export type updateDocument ={
    control_no: string,
    document_code: string;
    document_title: string;
    document_type: number;
    category: number;
    office: number;
    remarks: string;
    confidential: boolean;
    sequence_no: number;
    date: string;
    modified_by: number;
    modified_at: string;
}

export type addRoute = {
    control_no: string;
    receiving_office: number;
    status: number;
    sequence_no: number;
    date: string;
    time: string;
    remarks: string;
    created_by: number;
}

export type addAttachment = {
    control_no: string;
    attachment: number;
}

export type addBatch = {
    batch_no: number;
    control_no: string;
    created_by: number;
    date: string;
}