import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import {addAttachment, updateAttachment, addCategory, updateCategory, addDocType, updateDocType} from '../types/library.types'

@Injectable({
  providedIn: 'root',
})
export class LibrariesService {
  	private readonly supabase: SupabaseClient;
	constructor() {
		this.supabase = createClient(
			environment.supabaseUrl,
			environment.supabaseKey
		);
	}

	// CATEGORY 
  	// | ----------------------------------------------------------- |

	async add_category(payload: addCategory){
		return await this.supabase.schema('dts').from('category').insert({
			category_name: payload.category_name, created_by: payload.created_by
		});
	}

	async update_category(payload: updateCategory){
		return await this.supabase.schema('dts').from('category').update({
			category_name: payload.category_name, modified_at: payload.modified_at,
			modified_by: payload.modified_by
		}).eq('id', payload.id);
	}

	async delete_category(id: number){
		return await this.supabase.schema('dts').from('category').update({
		isActive: false}).eq('id', id);
	}

	async get_categories(){
    	return await this.supabase.schema('dts').from('category').select()
    	.eq('isActive', true).order('id', { ascending: false });
  	}


	// ATTACHMENTS 
  	// | ----------------------------------------------------------- |

	async add_attachment(payload: addAttachment){
		return await this.supabase.schema('dts').from('attachments').insert({
			attachment_name: payload.attachment_name, created_by: payload.created_by
		});
	}

	async update_attachment(payload: updateAttachment){
		return await this.supabase.schema('dts').from('attachments').update({
			attachment_name: payload.attachment_name, modified_at: payload.modified_at,
			modified_by: payload.modified_by
		}).eq('id', payload.id);
	}

	async delete_attachment(id: number){
		return await this.supabase.schema('dts').from('attachments').update({
		isActive: false}).eq('id', id);
	}

	async get_attachment(){
    	return await this.supabase.schema('dts').from('attachments').select()
    	.eq('isActive', true).order('id', { ascending: false });
  	}


	// DOCUMENT TYPE 
  	// | ----------------------------------------------------------- |

	async add_doc_type(payload: addDocType){
		return await this.supabase.schema('dts').from('document_type').insert({
			type_name: payload.type_name, created_by: payload.created_by
		});
	}

	async update_doc_type(payload: updateDocType){
		return await this.supabase.schema('dts').from('document_type').update({
			type_name: payload.type_name, modified_at: payload.modified_at,
			modified_by: payload.modified_by
		}).eq('id', payload.id);
	}

	async delete_doc_type(id: number){
		return await this.supabase.schema('dts').from('document_type').update({
		isActive: false}).eq('id', id);
	}

	async get_doc_type(){
    	return await this.supabase.schema('dts').from('document_type').select()
    	.eq('isActive', true).order('id', { ascending: false });
  	}

	//USER ROLE
	// | ----------------------------------------------------------- |

	async add_user_role(empID: number, created_by: number){
		return await this.supabase.schema('dts').from('user_roles').insert({
			c_empID: empID, created_by: created_by, role: 1
		});
	}

	async delete_user_role(id: number){
		return await this.supabase.schema('dts').from('user_roles').update({
		isActive: false}).eq('id', id);
	}

	async get_user_role(){
    	return await this.supabase.schema('dts').from('users').select()
    	.eq('isActive', true).order('id', { ascending: false });
  	}
}
