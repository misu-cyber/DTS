import { Component, inject, signal, OnInit, AfterViewInit, WritableSignal, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AdminService } from '../services/admin';
import { DashboardService } from '../services/dashboard';
import { UserService } from '../services/user';

import DataTable from 'datatables.net';

import swal from 'sweetalert2';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-admin',
  imports: [FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})

export class Admin implements OnInit{

	// VARIABLES 
  	// | ----------------------------------------------------------- |
  
  	datatable: any;
	data: any[] =[];
	result: any;
	value: any;
	result_routes: any;
	result_attachments: any;
	user: any;
	transfer: any;
	transfer_office: any;

	value_route: {
		title: string;
		value: string;
	}[]=[]

	empID : WritableSignal<number> = signal(0);
	employee: any;
	employee_details: any;
	user_role: any;
	employees: any;

	control_no: any
	title: any;
	code: any;
	category: any;
	remarks: any;
	docType: any;
	confidential: any;
	attachment: any;
	route: any;
	status: any

	now: Date = new Date();
	formattedTime: string = new Intl.DateTimeFormat('en-US', {
		timeZone: 'Asia/Manila',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false
	}).format(this.now)

	formattedDate = this.now.getFullYear() + '-' + String(this.now.getMonth() + 1).padStart(2, '0') + '-' + String(this.now.getDate()).padStart(2, '0');


  	// DECLARATION 
  	// | ----------------------------------------------------------- |
  
  	private readonly adminService = inject(AdminService);
	private readonly dashboardService = inject(DashboardService);
	private readonly userService = inject(UserService);
	private readonly router = inject(Router);

	constructor(
  		private cdr: ChangeDetectorRef
	) {}


  	// FUNCTIONS 
  	// | ----------------------------------------------------------- |

	ngOnInit() {
		this.fetchUser();
	}
	

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
				let i = 0;
				
				if(search){
					const{data, count, error} = await this.adminService.getDocumentsSearch(from, to, search);
					
					data?.forEach(x => {
						this.data.push({
							id: x.id,
							status: x.status,
							no: i+=1,
							control_no: x.control_no,
							document_title: x.document_title,
							fullname_creator: x.fullname_creator,
							current_location: x.current_location,
							status_name: x.status_name,
						});
					});

					callback({
						draw: dataTablesParameters.draw,
						recordsTotal: count ?? 0,
						recordsFiltered: count ?? 0,
						data: this.data ?? []
					});
				} else {
					const{data, count, error} = await this.adminService.getDocuments(from, to);

					data?.forEach(x => {
						this.data.push({
							id: x.id,
							status: x.status,
							no: i+=1,
							control_no: x.control_no,
							document_title: x.document_title,
							fullname_creator: x.fullname_creator,
							current_location: x.current_location,
							status_name: x.status_name
						});
					});
					
					callback({
						draw: dataTablesParameters.draw,
						recordsTotal: count ?? 0,
						recordsFiltered: count ?? 0,
						data: this.data ?? []
					});
				}
			},
			columns: [
				{ data: 'id' },
				{ data: 'status' },
				{ data: 'no' },
				{ data: 'control_no' },
				{ data: 'document_title' },
				{ data: 'fullname_creator'},
				{ data: 'current_location'},
				{ data: 'status_name'},
				{
					data: null,
					title: 'Action',
					render: function (data, type, row) {
					return `
						<div class="btn btn-group">
							<button class="primary-btn btn-view" data-id="${row.id}" data-status="${row.status}" data-bs-toggle="modal" data-bs-target="#view"><i class="fa fa-file"></i></button>
						</div>
					`;
					}
				}
			],
			columnDefs: [
				{
					targets: [0,1],
					visible: false
				}
			],
			order: [[0, 'desc']],
			pageLength: 10,
		});

		$('#tblDocuments tbody').on('click', '.btn-view', (event: any) => {
			const id = $(event.currentTarget).data('id');
			const status = $(event.currentTarget).data('status');

			this.viewDocument(id, status)
			
  		});

		// $('#tblDocuments tbody').on('click', '.btn-transfer', (event: any) => {
		// 	const id = $(event.currentTarget).data('id');

		// 	this.transferDocument()
			
  		// });
	}

	//FETCH DATA
	async fetchUser() {
		const { data } = await this.userService.getUser();
		this.user = data.user;
		if (!this.user) {
			this.router.navigate(['/login']);
		} else {
			this.result = await this.userService.getEmployee(this.user.email); 
			this.employee = this.result.data[0];
			this.empID.set(this.employee.c_empID);
			this.result = await this.userService.getEmployeeDetails(this.employee.c_empID);
			this.employee_details = this.result.data[0];
			this.user_role = localStorage.getItem('role')
			this.cdr.detectChanges();
		}
	}

	//TRANSACTIONS
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

	async viewTransfer(){
		this.result = await this.userService.getEmployees();
		this.employees = this.result.data;

		this.cdr.detectChanges();
	}

	async transferDocument(){
		this.value = await this.dashboardService.get_sequence_no(this.control_no)
		this.transfer_office = Object.values(this.employees).find((x : any) => x.c_empID == this.transfer)

		this.result_routes = await this.dashboardService.create_route({
			control_no: this.control_no,
			receiving_office: this.transfer_office.c_office,
			status: 3,
			sequence_no: this.value.data[0].sequence_no + 1,
			date: this.formattedDate,
			time: this.formattedTime,
			remarks: '',
			created_by: Number(this.transfer)
		});

		if(this.result_routes.error){
			swal.fire({
				icon: "error",
				title: "Error",
				text: "Please try again",
			});
		} else {
			swal.fire({
				icon: "success",
				title: "Received",
				text: "Document has been received.",
			})
			.then((result) => {
				if (result.isConfirmed) {
					location.reload();
				}
			});
		}
	}

	async completeDocument(control_no: string){
	
		swal.fire({
			title: "Are you sure you want to complete the document?",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#3FA34D",
			cancelButtonColor: "gray",
			confirmButtonText: "Yes, complete!"
		}).then(async (result) => {
			if (result.isConfirmed) {
				this.value = await this.dashboardService.get_sequence_no(this.control_no)

				this.result_routes = await this.dashboardService.create_route({
					control_no: this.control_no,
					receiving_office: this.employee_details.c_office,
					status: 4,
					sequence_no: this.value.data[0].sequence_no + 1,
					date: this.formattedDate,
					time: this.formattedTime,
					remarks: 'Document completed',
					created_by: Number(localStorage.getItem('empID'))
				});
		
				if(this.result_routes.error){
				swal.fire({
					icon: "error",
					title: "Error",
					text: "Please try again",
				});
				} else {
					swal.fire({
						icon: "success",
						title: "Completed",
						text: "Document has been completed.",
					}).then((result) => {
						if (result.isConfirmed) {
							location.reload();
						}
					});
				}
			} else {
				swal.close();
			}
		});
		
	}
	
	async cancelDocument(control_no: string){

		swal.fire({
			title: "Are you sure you want to revoke the document?",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#C7383A",
			cancelButtonColor: "gray",
			confirmButtonText: "Yes, revoke!"
		}).then(async (result) => {
			if (result.isConfirmed) {
				this.value = await this.dashboardService.get_sequence_no(this.control_no)

				this.result_routes = await this.dashboardService.create_route({
					control_no: this.control_no,
					receiving_office: this.employee_details.c_office,
					status: 5,
					sequence_no: this.value.data[0].sequence_no + 1,
					date: this.formattedDate,
					time: this.formattedTime,
					remarks: 'Document cancelled',
					created_by: Number(localStorage.getItem('empID'))
				});
		
				if(this.result_routes.error){
				swal.fire({
					icon: "error",
					title: "Error",
					text: "Please try again",
				});
				} else {
					swal.fire({
						icon: "success",
						title: "Cancelled",
						text: "Document has been cancelled.",
					}).then((result) => {
						if (result.isConfirmed) {
							location.reload();
						}
					});
				}
			} else {
				swal.close();
			}
		});
		
	}

	//PRINT / PDF
	printRouting(control_no: string){

		//SETTING OF VALUES IN ARRAY
		this.value_route.length = 0;

		this.value_route.push({
			title: "Control No.",
			value: this.control_no
		});

		this.value_route.push({
			title: "Document Title",
			value: this.title
		});

		this.value_route.push({
			title: "Document Code",
			value: this.code
		});

		this.value_route.push({
			title: "Document Type",
			value: this.docType
		});

		this.value_route.push({
			title: "Attachments",
			value: this.code
		});

		this.value_route.push({
			title: "Originating Office",
			value: this.value.data[0].originating_office
		});

		this.value_route.push({
			title: "Created By",
			value: this.value.data[0].fullname_creator
		});

		this.value_route.push({
			title: "Date Created",
			value: this.value.data[0].date
		});

		// SETTING BARCODE
		const canvas = document.createElement('canvas');
		JsBarcode(canvas, `${this.control_no}`, {
			format: 'CODE128'
		});
		const barcodeImage = canvas.toDataURL('image/png');

		//CREATION OF PDF
		const doc = new jsPDF('p', 'mm', 'a4');
		const img = new Image();
		img.src = 'assets/images/TEC_B.png';
	
		doc.setFontSize(12);
		doc.setFont('BookAntiqua');

		doc.addImage(
			img,
			'PNG',
			15,
			10,
			55,
			15
		);

		doc.addImage(
			barcodeImage,
			'PNG',
			140,
			9,
			50,
			20
		);

		doc.line(15, 30, 195, 30);

		const body = this.value_route.map((route: {
			title: any;
			value: any;
		}) => [
			route.title,
			route.value
		]);

		autoTable(doc, {
			startY: 35,
			body,
			styles: {
				font: 'BookAntiqua',
				fontSize: 9,
				cellPadding: 0.5,
			},
			columnStyles: {
				0: { halign: 'left', cellWidth: 40},
				1: { halign: 'left' }
			}
		})

		doc.save(`ROUTING SLIP_${control_no}.pdf`);
	}
}
