import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import {SignupPayload, LoginPayload} from '../types/user.types'

@Injectable({
  providedIn: 'root',
})

export class UserService {
   private readonly supabase: SupabaseClient;
   constructor() {
		this.supabase = createClient(
			environment.supabaseUrl,
			environment.supabaseKey
		);
	}


	// SIGN IN AND LOGIN 
  	// | ----------------------------------------------------------- |

	async signInWithEmail(payload: SignupPayload) {
    	return await this.supabase.auth.signInWithPassword({
      		email: payload.email,
      		password: payload.password,
    	});
  	}

	async signUpWithEmail(payload: LoginPayload) {
    	return await this.supabase.auth.signUp({
      		email: payload.email,
      		password: payload.password
      	});
  	}


	// EMPLOYEE DETAILS 
  	// | ----------------------------------------------------------- |

	async getEmployees(){
		return await this.supabase.schema('public').from('employee_list').select().eq('isActive', true).order('c_surname', { ascending: true });
	}
	
	async getEmployee(email?: string) {
		return await this.supabase.schema('public').from('employee_list').select().eq('c_email', email);
	}

	async getEmployeeDetails(empID?: number) {
		return await this.supabase.schema('public').from('employee_details').select().eq('c_empID', empID);
	}

	async getUserRole(empID?: number){
		return await this.supabase.schema('dts').from('user_roles').select().eq('c_empID', empID)
		.order('created_at', {ascending: false}).limit(1);
	}


	// DOCUMENTS 
  	// | ----------------------------------------------------------- |

	async getDocuments(from: number, to: number){
		return await this.supabase.schema('dts').from('document_details').select('*', { count: 'exact' })
					 .eq('isConfidential', false).range(from, to);
	}

	async getDocumentsSearch(from: number, to: number, search: string){
		return await this.supabase.schema('dts').from('document_details').select('*', { count: 'exact' })
					 .eq('isConfidential', false).or(`control_no.ilike.%${search}%, document_title.ilike.%${search}%`)
					 .range(from, to);
	}


	// USER AND SIGN OUT 
  	// | ----------------------------------------------------------- |

	async getUser() {
    	return await this.supabase.auth.getUser();
  	}

  	async signOut() {
    	return await this.supabase.auth.signOut();
  	}

}
