import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
   private readonly supabase: SupabaseClient;
   constructor() {
		this.supabase = createClient(
			environment.supabaseUrl,
			environment.supabaseKey
		);
	}

	// DOCUMENTS 
  	// | ----------------------------------------------------------- |

	async getDocuments(from: number, to: number){
		return await this.supabase.schema('dts').from('document_details').select('*', { count: 'exact' })
					 .eq('isConfidential', false).order('control_no', {'ascending': false}).range(from, to);
	}

	async getDocumentsSearch(from: number, to: number, search: string){
		return await this.supabase.schema('dts').from('document_details').select('*', { count: 'exact' })
					 .eq('isConfidential', false).or(`control_no.ilike.%${search}%, document_title.ilike.%${search}%`)
					 .order('control_no', {'ascending': false}).range(from, to);
	}
}
