import { Component, inject, signal, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../services/user';
import { DashboardService } from '../../services/dashboard';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import DataTable from 'datatables.net';

import swal from 'sweetalert2';


@Component({
	selector: 'app-login',
  	imports: [FormsModule],
  	templateUrl: './login.html',
  	styleUrl: './login.scss',
})

export class Login implements AfterViewInit {

	// VARIABLES 
  	// | ----------------------------------------------------------- |
	email = signal('');
	password = signal('');

  	result : any;
	value : any;
	result_attachments: any;
	result_routes: any;

	control_no: any
	title: any;
	code: any;
	category: any;
	remarks: any;
	docType: any;
	confidential: any;
	attachment: any;
	route: any;
	status: any;

	datatable: any;

	pageSize = 8;
	currentPage = 1;
	totalPages = 0;
	totalRecords = 0;

	search : any;

	constructor(
  		private cdr: ChangeDetectorRef
	) {}

	// DECLARATIONS 
  	// | ----------------------------------------------------------- |
	private readonly userService = inject(UserService);
	private readonly dashboardService = inject(DashboardService);
	private readonly router = inject(Router);

	// FUNCTIONS 
  	// | ----------------------------------------------------------- |
	ngAfterViewInit() {
		this.datatable = new DataTable('#tblDocuments', {
			processing: true,
    		serverSide: true,

			ajax: async (dataTablesParameters: any, callback: any) => {
				const start = dataTablesParameters.start;   
				const length = dataTablesParameters.length;
				const search = dataTablesParameters.search.value;

				const from = start;
				const to = start + length - 1;
				
				if(search){
					const{data, count, error} = await this.userService.getDocumentsSearch(from, to, search);
					
					callback({
						draw: dataTablesParameters.draw,
						recordsTotal: count ?? 0,
						recordsFiltered: count ?? 0,
						data: data ?? []
					});
				} else {
					const{data, count, error} = await this.userService.getDocuments(from, to);

					callback({
						draw: dataTablesParameters.draw,
						recordsTotal: count ?? 0,
						recordsFiltered: count ?? 0,
						data: data ?? []
					});
				}
			},
			columns: [
				{ data: 'control_no' },
				{ data: 'document_title' },
				{ data: 'status'}
			],
			pageLength: 10
		});
	}

	async fetchDocs(page: number=1){
		const from = (page - 1) * this.pageSize;
  		const to = from + this.pageSize - 1;

		const { data, count, error } = await this.userService.getDocumentsSearch(from, to, this.search)

		if (!error) {
			this.result = data ?? [];
			this.totalRecords = count ?? 0;
			this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
			this.currentPage = page;
		}

		this.cdr.detectChanges();
	}

		nextPage() {
			if (this.currentPage < this.totalPages) {
				this.fetchDocs(this.currentPage + 1);
			}
			this.cdr.detectChanges();
		}

		previousPage() {
			if (this.currentPage > 1) {
				this.fetchDocs(this.currentPage - 1);
			}
			this.cdr.detectChanges();
		}

		goToPage(page: number) {
			this.fetchDocs(page);
			this.cdr.detectChanges();
		}

		get pages(): number[] {
			return Array.from(
				{ length: this.totalPages },
				(_, i) => i + 1
			);
		}

	async viewDocument(id: number, status: number){

		this.value = await this.dashboardService.get_document_detail(id);

		this.control_no = this.value.data[0].control_no
		this.title = this.value.data[0].document_title
		this.code = this.value.data[0].document_code
		this.docType = this.value.data[0].type_name
		this.category = this.value.data[0].category_name
		this.remarks = this.value.data[0].remarks
		this.confidential = this.value.data[0].isConfidential
		this.status = this.value.data[0].status

		this.result_attachments = await this.dashboardService.get_attachment_list(this.control_no)
		this.result_routes = await this.dashboardService.get_routes_list(this.control_no)

		this.attachment = this.result_attachments.data
		this.route = this.result_routes.data
		this.cdr.detectChanges();
	}
	

	async signInWithEmail() {

		swal.fire({
			title: 'Loading...',
			didOpen: () => {
				swal.showLoading();
			}
		});

		this.result = await this.userService.signInWithEmail({
		email: this.email(),
		password: this.password(),
		})

		if (this.result.data.session == null) {
			swal.close();
			swal.fire({
				icon: "error",
				title: "Sign In failed",
				text: 'Wrong username / password',
		});
      
		} else {
			this.result = await this.userService.getEmployee(this.email());      
			localStorage.setItem('empID', this.result.data[0].c_empID);
			//localStorage.setItem('role', this.result.data[0].c_user_role);
			localStorage.setItem('signatory', this.result.data[0].c_signatory);
			this.result = await this.userService.getUserRole(this.result.data[0].c_empID);
			
			console.log(this.result.data)
			if(this.result.data.length == 1){
				if(this.result.data[0].isActive == true) {
					localStorage.setItem('role', '1');
				} else {
					localStorage.setItem('role', '2');
				}
			} else {
				localStorage.setItem('role', '2');
			}

			this.router.navigate(['/dashboard']);
			swal.close();
		}
  	}
}
