import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { addDocument, updateDocument, addRoute, addAttachment, addBatch} from '../types/document.types'

@Injectable({
  providedIn: 'root',
})

export class DashboardService {
  	private readonly supabase: SupabaseClient;
	constructor() {
		this.supabase = createClient(
			environment.supabaseUrl,
			environment.supabaseKey
		);
	}

	// DROPDOWNS 
  	// | ----------------------------------------------------------- |

	async get_attachment(){
    	return await this.supabase.schema('dts').from('attachments').select()
    	.eq('isActive', true).order('attachment_name', { ascending: true });
  	}

	async get_categories(){
    	return await this.supabase.schema('dts').from('category').select()
    	.eq('isActive', true).order('category_name', { ascending: true });
  	}

	async get_doc_type(){
    	return await this.supabase.schema('dts').from('document_type').select()
    	.eq('isActive', true).order('type_name', { ascending: true });
  	}

	// DOCUMENT 
  	// | ----------------------------------------------------------- |

	async get_control_no(day: string){
		return await this.supabase.schema('dts').from('docs').select('control_no').ilike('date', day)
					 .limit(1).order('created_at', {ascending: false});
	}

	async get_created_document(from: number, to: number, empID?: string){
		return await this.supabase.schema('dts').from('document_details').select('*', { count: 'exact' })
					 .order('control_no', {ascending: false})
					 .eq('created_by', empID)
					 //.or(`document_holder.eq.${empID},created_by.eq.${empID}`)
					 .neq('status', 4).neq('status', 5)
					 .range(from, to);
	}

	async get_received_document(from: number, to: number, empID?: string){
		return await this.supabase.schema('dts').from('document_details').select('*', { count: 'exact' })
					 .order('control_no', {ascending: false})
					 .eq('document_holder', empID)
					 .eq('status', 3)
					 //.or(`document_holder.eq.${empID},created_by.eq.${empID}`)
					 .range(from, to);
	}

	async get_completed_document(from: number, to: number, empID?: string){
		return await this.supabase.schema('dts').from('document_details').select('*', { count: 'exact' })
					 .order('control_no', {ascending: false}).eq('created_by', empID)
					 .eq('status', 4)
					 .range(from, to);
	}

	async get_cancelled_document(from: number, to: number, empID?: string){
		return await this.supabase.schema('dts').from('document_details').select('*', { count: 'exact' })
					 .order('control_no', {ascending: false})
					 .eq('created_by', empID).eq('status', 5)
					 .range(from, to);
	}

	async get_release_document(empID?: string){
		return await this.supabase.schema('dts').from('document_details').select()
					 .order('control_no', {ascending: false})
					 .eq('document_holder', empID)
					 .or('status.eq.1,status.eq.3');
	}

	async get_document_detail(id: number){
		return await this.supabase.schema('dts').from('document_details').select()
					 .eq('id', id);
	}

	async create_document(payload: addDocument){
		return await this.supabase.schema('dts').from('docs').insert({
			control_no: payload.control_no, 
			document_title: payload.document_title, 
			document_code: payload.document_code,
			document_type: payload.document_type, 
			category: payload.category, 
			office: payload.office, 
			remarks: payload.remarks,
			sequence_no: payload.sequence_no, 
			isConfidential: payload.confidential, 
			date: payload.date, 
			created_by: payload.created_by 
		});
	}

	async update_document(payload: updateDocument){
		return await this.supabase.schema('dts').from('docs').update({
			document_title: payload.document_title, 
			document_code: payload.document_code,
			document_type: payload.document_type, 
			category: payload.category, 
			office: payload.office, 
			remarks: payload.remarks,
			sequence_no: payload.sequence_no, 
			isConfidential: payload.confidential, 
			date: payload.date,
			modified_by: payload.modified_by, 
			modified_at: payload.modified_at
		}).eq('control_no',payload.control_no);
	}
	
	async update_sequence_no(sequence_no: number, control_no: string){
		return await this.supabase.schema('dts').from('docs').update({sequence_no: sequence_no}).eq('control_no', control_no)
	}

	async delete_document(control_no: string){
		return await this.supabase.schema('dts').from('docs').update({isActive: false}).eq('control_no', control_no);
	}

	// DOCUMENT ATTACHMENT 
  	// | ----------------------------------------------------------- |
	
	async get_attachment_list(control_no: string){
		return await this.supabase.schema('dts').from('attachment_list').select()
					 .eq('control_no', control_no)
	}

	async create_attachment(payload: addAttachment){
		return await this.supabase.schema('dts').from('docs_attachments').insert({
			control_no: payload.control_no,
			attachment: payload.attachment
		});
	}

	// DOCUMENT ROUTE 
  	// | ----------------------------------------------------------- |

	async get_sequence_no(control_no: string){
		return await this.supabase.schema('dts').from('route').select('sequence_no').eq('control_no', control_no)
					 .limit(1).order('created_at', {ascending: false});
	}

	async get_routes_list(control_no: string){
		return await this.supabase.schema('dts').from('route_list').select().eq('control_no', control_no)
					 .eq('isActive', true)
	}

	async get_batch_no(){
		return await this.supabase.schema('dts').from('batch').select('batch_no')
					 .limit(1).order('created_at', {ascending: false});
	}

	async get_batch_list(empId?: string){
		return await this.supabase.schema('dts').from('batch_list').select().eq('created_by', empId)
					 .order('batch', {ascending: false});
	}

	async get_batch(batch_no?: string){
		return await this.supabase.schema('dts').from('receiving_slip').select().eq('batch_no', batch_no)
					 .order('control_no', {ascending: true});
	}

	async check_document_status(control_no: string){
		return await this.supabase.schema('dts').from('document_details').select('status').eq('control_no', control_no)
	}

	async create_route(payload: addRoute){
		return await this.supabase.schema('dts').from('route').insert({
			control_no: payload.control_no, 
			receiving_office: payload.receiving_office, 
			status: payload.status,
			sequence_no: payload.sequence_no, 
			date: payload.date,
			time: payload.time,
			remarks: payload.remarks,
			created_by: payload.created_by
		});
	}

	async create_batch(payload: addBatch){
		return await this.supabase.schema('dts').from('batch').insert({
			batch_no: payload.batch_no,
			control_no: payload.control_no,
			created_by: payload.created_by,
			date: payload.date
		});
	}
}


