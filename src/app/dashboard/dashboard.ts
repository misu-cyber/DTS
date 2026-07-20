import { Component, inject, OnInit, signal, Signal, WritableSignal, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '../services/user';
import { DashboardService } from '../services/dashboard';

import swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseClient } from '@supabase/supabase-js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import JsBarcode from 'jsbarcode';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import 'select2';

declare var $: any;
declare const window: any;

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit{

	// DECLARATIONS 
  	// | ----------------------------------------------------------- |
	private readonly userService = inject(UserService);
	private readonly dashboardService = inject(DashboardService);
  	private readonly router = inject(Router);

	constructor(
  		private cdr: ChangeDetectorRef
	) {}



	// VARIABLES 
  	// | ----------------------------------------------------------- |
	user: any;
	result: any;
	result_document: any;
	result_attachments: any;
	result_routes: any;
	result_batch: any;
	value: any;
	value_batch: {
		no: number;
		control_no: string;
		document_title: string;
		document_date: string;
		document_type: string;
		attachment:string;
		remarks: string;
	}[] = [];
	value_route: {
		title: string;
		value: string;
	}[]=[]

	empID : WritableSignal<number> = signal(0);
	employee: any;
	employee_details: any;
	user_role: any;

	control_no: any
	title: any;
	code: any;
	category: any;
	remarks: any;
	docType: any;
	confidential: any;
	attachment: any;
	route: any[] = [];
	status: any
	batch_no: any;
	action = "2";
	title_view: any;
	remarks_view: any;

	document: any;

	attachments: any;
	categories: any;
	doctypes: any;
	forRelease: any;
	selectedAttachments : any[]=[];	

	release_remarks: any;
	document_complete: any;
	document_revoke: any;

	createddocs: any;
	completeddocs: any;
	cancelleddocs: any;
	releasedocs: any;
	receiveddocs: any;
	releasedbatch: any;
	searchdocs: any;

	pageSize = 8;
	currentPageCreated = 1;
	totalPagesCreated = 0;
	totalRecordsCreated = 0;

	currentPageReceived = 1;
	totalPagesReceived = 0;
	totalRecordsReceived = 0;

	currentPageCompleted = 1;
	totalPagesCompleted = 0;
	totalRecordsCompleted = 0;

	currentPageCancelled = 1;
	totalPagesCancelled = 0;
	totalRecordsCancelled = 0;

	currentPage = 1;
	totalPages = 0;
	totalRecords = 0;

	search: any;
	count_notif: any;

	day: any;

	now: Date = new Date();

  	// formattedDate: string = new Intl.DateTimeFormat('en-US', {
	// 	timeZone: 'Asia/Manila',
	// 	year: 'numeric',
	// 	month: '2-digit',
	// 	day: '2-digit'
	// }).format(this.now);
    
	formattedTime: string = new Intl.DateTimeFormat('en-US', {
		timeZone: 'Asia/Manila',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false
	}).format(this.now)

	formattedDate = this.now.getFullYear() + '-' + String(this.now.getMonth() + 1).padStart(2, '0') + '-' + String(this.now.getDate()).padStart(2, '0');
	date = this.now.getFullYear() + String(this.now.getMonth() + 1).padStart(2, '0') + String(this.now.getDate()).padStart(2, '0');
	

	@ViewChild('video')
  	video!: ElementRef<HTMLVideoElement>;

  	barcode = '';

  	codeReader = new BrowserMultiFormatReader();
	controls!: IScannerControls;

	@ViewChild('attachmentSelect')
  	attachmentSelect!: ElementRef<HTMLSelectElement>;
	

	// FUNCTIONS 
  	// | ----------------------------------------------------------- |
	ngOnInit() {
		this.fetchUser();
		this.fetchAttachment();
		this.fetchCategory();
		this.fetchDocType();
		this.fetchDocCreated(1);
		this.fetchDocCompleted(1);
		this.fetchDocCancelled(1);
		this.fetchDocRelease();
		this.fetchDocReceived(1);
		this.fetchReleasedBatch();
		//this.startScanner();
		this.cdr.detectChanges();
  	}

	ngAfterViewInit() {
		this.selectedAttachments = [];
		const $select = $(this.attachmentSelect.nativeElement);

		// $select.select2({
		// 	width: '100%',
		// 	placeholder: 'Select Attachment',
		// 	dropdownParent: $('#create')
		// });

		$('#create').on('shown.bs.modal', () => {

			const $select = $('#attachmentDropdown');

			if ($select.hasClass('select2-hidden-accessible')) {
				$select.select2('destroy');
			}

			$select.select2({
				dropdownParent: $('#create'),
				width: '100%'
			});;

			$select.on('change', () => {
				this.selectedAttachments = $select.val();
			});
		});
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

		console.log(this.employee);
	}

	async fetchAttachment(){
		this.result = await this.dashboardService.get_attachment();
		this.attachments = this.result.data;
		this.cdr.detectChanges();
	}

	async fetchCategory(){
		this.result = await this.dashboardService.get_categories();
		this.categories = this.result.data;
		this.cdr.detectChanges();
	}

	async fetchDocType(){
		this.result = await this.dashboardService.get_doc_type();
		this.doctypes = this.result.data;
		this.cdr.detectChanges();
	}

	async fetchDocCreated(page: number = 1){
		const from = (page - 1) * this.pageSize;
  		const to = from + this.pageSize - 1;

		const { data, count, error } = await this.dashboardService.get_created_document(from, to, localStorage.getItem('empID')?.toString());

		if (!error) {
			this.createddocs = data ?? [];
			this.totalRecordsCreated = count ?? 0;
			this.totalPagesCreated = Math.ceil(this.totalRecordsCreated / this.pageSize);
			this.currentPageCreated = page;
		}

		this.cdr.detectChanges();
		// this.result = await this.dashboardService.get_created_document(localStorage.getItem('empID')?.toString());
		// this.createddocs = this.result.data;
	}

		nextPageCreated() {
			if (this.currentPageCreated < this.totalPagesCreated) {
				this.fetchDocCreated(this.currentPageCreated + 1);
			}
			this.cdr.detectChanges();
		}

		previousPageCreated() {
			if (this.currentPageCreated > 1) {
				this.fetchDocCreated(this.currentPageCreated - 1);
			}
			this.cdr.detectChanges();
		}

		goToPageCreated(page: number) {
			this.fetchDocCreated(page);
			this.cdr.detectChanges();
		}

		get pagesCreated(): number[] {
			return Array.from(
				{ length: this.totalPagesCreated },
				(_, i) => i + 1
			);
		}

	async fetchDocCompleted(page: number = 1){
		const from = (page - 1) * this.pageSize;
  		const to = from + this.pageSize - 1;

		const{data, count, error} = await this.dashboardService.get_completed_document(from, to, localStorage.getItem('empID')?.toString());
		
		if (!error) {
			this.completeddocs = data ?? [];
			this.totalRecordsCompleted = count ?? 0;
			this.totalPagesCompleted = Math.ceil(this.totalRecordsCompleted / this.pageSize);
			this.currentPageCompleted = page;
		}
		
		// this.result = await this.dashboardService.get_completed_document(localStorage.getItem('empID')?.toString());
		// this.completeddocs = this.result.data;
		this.cdr.detectChanges();
	}
		nextPageCompleted() {
			if (this.currentPageCompleted < this.totalPagesCompleted) {
				this.fetchDocCompleted(this.currentPageCompleted + 1);
			}
			this.cdr.detectChanges();
		}

		previousPageCompleted() {
			if (this.currentPageCompleted > 1) {
				this.fetchDocCompleted(this.currentPageCompleted - 1);
			}
			this.cdr.detectChanges();
		}

		goToPageCompleted(page: number) {
			this.fetchDocCompleted(page);
			this.cdr.detectChanges();
		}

		get pagesCompleted(): number[] {
			return Array.from(
				{ length: this.totalPagesCompleted },
				(_, i) => i + 1
			);
		}

	async fetchDocCancelled(page: number = 1){
		const from = (page - 1) * this.pageSize;
  		const to = from + this.pageSize - 1;

		const{data, count, error} = await this.dashboardService.get_cancelled_document(from, to, localStorage.getItem('empID')?.toString());

		if (!error) {
			this.cancelleddocs = data ?? [];
			this.totalRecordsCancelled = count ?? 0;
			this.totalPagesCancelled = Math.ceil(this.totalRecordsCancelled / this.pageSize);
			this.currentPageCancelled = page;
		}

		// this.result = await this.dashboardService.get_cancelled_document(localStorage.getItem('empID')?.toString());
		// this.cancelleddocs = this.result.data;
		this.cdr.detectChanges();
	}

		nextPageCancelled() {
			if (this.currentPageCancelled < this.totalPagesCancelled) {
				this.fetchDocCompleted(this.currentPageCancelled + 1);
			}
			this.cdr.detectChanges();
		}

		previousPageCancelled() {
			if (this.currentPageCancelled > 1) {
				this.fetchDocCompleted(this.currentPageCancelled - 1);
			}
			this.cdr.detectChanges();
		}

		goToPageCancelled(page: number) {
			this.fetchDocCancelled(page);
			this.cdr.detectChanges();
		}

		get pagesCancelled(): number[] {
			return Array.from(
				{ length: this.totalPagesCancelled },
				(_, i) => i + 1
			);
		}

	async fetchDocRelease(){
		this.result = await this.dashboardService.get_release_document(localStorage.getItem('empID')?.toString());
		this.releasedocs = this.result.data.map((result: any) => ({...result, selected: false, release_remarks: null}))
		this.cdr.detectChanges();
	}

	async fetchDocReceived(page: number = 1){
		const from = (page - 1) * this.pageSize;
  		const to = from + this.pageSize - 1;

		const { data, count, error } = this.result = await this.dashboardService.get_received_document(from, to, localStorage.getItem('empID')?.toString());
		
		if (!error) {
			this.receiveddocs = data ?? [];
			this.totalRecordsReceived = count ?? 0;
			this.totalPagesReceived = Math.ceil(this.totalRecordsReceived / this.pageSize);
			this.currentPageReceived = page;
		}

		this.count_notif = count;

		// this.result = await this.dashboardService.get_received_document(localStorage.getItem('empID')?.toString());
		// this.receiveddocs = this.result.data;
		this.cdr.detectChanges();
	}

		nextPageReceived() {
			if (this.currentPageReceived < this.totalPagesReceived) {
				this.fetchDocReceived(this.currentPageReceived + 1);
			}
			this.cdr.detectChanges();
		}

		previousPageReceived() {
			if (this.currentPageReceived > 1) {
				this.fetchDocReceived(this.currentPageReceived - 1);
			}
			this.cdr.detectChanges();
		}

		goToPageReceived(page: number) {
			this.fetchDocReceived(page);
			this.cdr.detectChanges();
		}

		get pagesReceived(): number[] {
			return Array.from(
				{ length: this.totalPagesReceived },
				(_, i) => i + 1
			);
		}

	async fetchReleasedBatch(){
		const empId = localStorage.getItem('empID')?.toString();

		this.result = await this.dashboardService.get_batch_list(empId);
		this.releasedbatch = this.result.data;
		
		setTimeout(() => {
			$('#tblReleaseLogs').DataTable({
				order: [0, 'desc']
			});
		}, 0);
		this.cdr.detectChanges();
	}

	async fetchDocs(page: number=1){
		const from = (page - 1) * this.pageSize;
  		const to = from + this.pageSize - 1;

		const { data, count, error } = await this.dashboardService.getDocumentsSearch(from, to, this.search, localStorage.getItem('empID')?.toString())

		if (!error) {
			this.totalRecords = count ?? 0;
			this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
			this.currentPage = page;

			this.searchdocs = Array.from(
				new Map(data.map(item => [item.id, item])).values()
			) ?? [];
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

	async displayDropdown(){
		$('#attachmentDropdown').val([]).trigger('change');
	}


	//TRANSACTIONS
	async createDocument(){
		this.day = this.formattedDate + '%';
		this.result = await this.dashboardService.get_control_no(this.day)

		if(this.result.data == ''){
			this.control_no = this.date+'-'+'001'

			// const selectedAttachment = this.attachments.filter(
			// 	(attachment: { selected: any; }) => attachment.selected
			// );
			
			if(this.title == undefined || this.docType == undefined || this.category == undefined){
				swal.fire({
					icon: "error",
					title: "Error",
					text: "Please fill out all required fields",
				});
			} else {
				this.result_document = await this.dashboardService.create_document({
					control_no: this.control_no,
					document_title: this.title,
					document_code: this.code,
					document_type: this.docType,
					category: this.category,
					office: this.employee.c_office,
					remarks: this.remarks,
					confidential: this.confidential,
					date: this.formattedDate,
					created_by: Number(localStorage.getItem('empID')),
					sequence_no: 1,
					action: Number(this.action)
				});

				this.result_routes = await this.dashboardService.create_route({
					control_no: this.control_no,
					receiving_office: this.employee.c_office,
					status: 1,
					sequence_no: 1,
					date: this.formattedDate,
					time: this.formattedTime,
					remarks: this.remarks,
					created_by: Number(localStorage.getItem('empID'))
				});

				if(this.selectedAttachments.length > 0) {
					for(let x = 0; x<this.selectedAttachments.length; x++){
						this.result_attachments = await this.dashboardService.create_attachment({
							control_no: this.control_no,
							attachment: this.selectedAttachments[x]
						})
					}
				}
			}

		} else {
			const num = parseInt(this.result.data[0].control_no.replace(this.date + '-', '')) + 1;
			this.control_no = this.date+'-'+num.toString().padStart(3, '0');

			// const selectedAttachment = this.attachments.filter(
			// 	(attachment: { selected: any; }) => attachment.selected
			// );

			if(this.title == undefined || this.docType == undefined || this.category == undefined){
				swal.fire({
					icon: "error",
					title: "Error",
					text: "Please fill out all required fields",
				});
			} else {
				this.result_document = await this.dashboardService.create_document({
					control_no: this.control_no,
					document_title: this.title,
					document_code: this.code,
					document_type: this.docType,
					category: this.category,
					office: this.employee.c_office,
					remarks: this.remarks,
					confidential: this.confidential,
					date: this.formattedDate,
					created_by: Number(localStorage.getItem('empID')),
					sequence_no: 1,
					action: Number(this.action)
				});

				this.result_routes = await this.dashboardService.create_route({
					control_no: this.control_no,
					receiving_office: this.employee.c_office,
					status: 1,
					sequence_no: 1,
					date: this.formattedDate,
					time: this.formattedTime,
					remarks: this.remarks,
					created_by: Number(localStorage.getItem('empID'))
				});

				if(this.selectedAttachments.length > 0) {
					for(let x = 0; x<this.selectedAttachments.length; x++){
						this.result_attachments = await this.dashboardService.create_attachment({
							control_no: this.control_no,
							attachment: this.selectedAttachments[x]
						})
					}
				}

			}
		}

		if(this.result_document.error || this.result_routes.error){
		swal.fire({
			icon: "error",
			title: "Error",
			text: "Please try again",
		});
		} else {
			swal.fire({
				icon: "success",
				title: "Added",
				text: "Document has been created.",
			}).then((result) => {
				if (result.isConfirmed) {
					location.reload();
				}
			});
		}
	}

	async viewDocument(id: number, status: number){

		// switch(status){
		// 	case 1: 
		// 		this.value = Object.values(this.createddocs).find((x : any) => x.id == id)
		// 	break;

		// 	case 2: 
		// 		this.value = Object.values(this.createddocs).find((x : any) => x.id == id)
		// 	break;

		// 	case 3: 
		// 		this.value = Object.values(this.receiveddocs).find((x : any) => x.id == id)
		// 	break;

		// 	case 4:
		// 		this.value = Object.values(this.completeddocs).find((x : any) => x.id == id)
		// 	break;

		// 	case 5:
		// 		this.value = Object.values(this.cancelleddocs).find((x : any) => x.id == id)
		// 	break;
		// }

		this.route = []
		this.value = await this.dashboardService.get_document_detail(id);

		this.control_no = this.value.data[0].control_no
		this.title_view = this.value.data[0].document_title
		this.code = this.value.data[0].document_code
		this.docType = this.value.data[0].type_name
		this.category = this.value.data[0].category_name
		this.remarks_view = this.value.data[0].remarks
		this.confidential = this.value.data[0].isConfidential
		this.status = this.value.data[0].status
		this.action = this.value.data[0].action

		this.result_attachments = await this.dashboardService.get_attachment_list(this.control_no)
		this.result_routes = await this.dashboardService.get_routes_list(this.control_no)

		this.attachment = this.result_attachments.data
		//this.route = this.result_routes.data

		this.result_routes.data.forEach((x: any) => {
			this.route.push({
				date: x.date,
				time: this.formatTime(x.date, x.server_time.substring(11,19)),//this.formatTime(x.date, x.time),
				status: x.status,
				office: x.office,
				personnel: x.personnel,
				remarks: x.remarks
			})
		})

		this.cdr.detectChanges();
	}

	async releaseDocument(){
		this.result = await this.dashboardService.get_batch_no()
		this.releasedocs.forEach(async (docs: any) => {
			if(docs.selected == true){

				this.value = await this.dashboardService.get_sequence_no(docs.control_no)

				this.result_routes = await this.dashboardService.create_route({
					control_no: docs.control_no,
					receiving_office: this.employee.c_office,
					status: 2,
					sequence_no: this.value.data[0].sequence_no + 1,
					date: this.formattedDate,
					time: this.formattedTime,
					remarks: docs.release_remarks,
					created_by: Number(localStorage.getItem('empID'))
				});

				if(this.result.data == ''){
					this.batch_no = this.now.getFullYear() + '-000001'

					this.result_batch = await this.dashboardService.create_batch({
						batch_no: this.batch_no,
						control_no: docs.control_no,
						created_by: Number(localStorage.getItem('empID')),
						date: this.formattedDate
					});

				} else {
					const num = parseInt(this.result.data[0].batch_no.replace(this.now.getFullYear() + '-', '')) + 1;
					this.batch_no = this.now.getFullYear() + '-' +num.toString().padStart(6, '0');

					this.result_batch = await this.dashboardService.create_batch({
						batch_no: this.batch_no,
						control_no: docs.control_no,
						created_by: Number(localStorage.getItem('empID')),
						date: this.formattedDate
					});
				}

			}
		});

		// if(this.result_routes.error){
		// swal.fire({
		// 	icon: "error",
		// 	title: "Error",
		// 	text: "Please try again",
		// });
		// } else {
			swal.fire({
				icon: "success",
				title: "Release",
				text: "Document/s have been released.",
			}).then((result) => {
				if (result.isConfirmed) {
					location.reload();
				}
			});
		// }
	}

	async receiveDocument(){
		this.result = await this.dashboardService.check_document_status(this.document);
		
		if(this.result.data[0].status == 2){

			this.value = await this.dashboardService.get_sequence_no(this.document)

			this.result_routes = await this.dashboardService.create_route({
				control_no: this.document,
				receiving_office: this.employee_details.c_office,
				status: 3,
				sequence_no: this.value.data[0].sequence_no + 1,
				date: this.formattedDate,
				time: this.formattedTime,
				remarks: '',
				created_by: Number(localStorage.getItem('empID'))
			});

			this.document = '';
		
			if(this.result_routes.error){
				swal.fire({
					icon: "error",
					title: "Error",
					text: "Please try again",
					showConfirmButton: false,
					timer: 1500
				});
			} else {
				swal.fire({
					icon: "success",
					title: "Received",
					text: "Document has been received.",
					showConfirmButton: false,
					timer: 1500
				});
				// .then((result) => {
				// 	if (result.isConfirmed) {
				// 		location.reload();
				// 	}
				// });
			}
		} else {
			swal.fire({
				icon: "error",
				title: "Error",
				text: "Document cannot be routed. This document is not released.",
				showConfirmButton: false,
				timer: 1500
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
					remarks: this.document_complete,
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
					remarks: this.document_revoke,
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

	async startScanner() {

		const devices = await BrowserMultiFormatReader.listVideoInputDevices();

		await this.codeReader.decodeFromVideoDevice(
		devices[0].deviceId,
		this.video.nativeElement,
		(result, error) => {
			if (result) {
				this.document = '';
				this.document = result.getText();
				// this.controls.stop();
			}
		}
		);
		this.cdr.detectChanges();
	}


	//PRINT / PDF
	printRouting(control_no: string){

		let attach = '';
		for(let y=0; y<Object.keys(this.attachment).length; y++){
			
			if(y != Object.keys(this.attachment).length - 1)
			{
				attach += this.attachment[y].attachment_name;
				attach += ', ';
			} else {
				attach += this.attachment[y].attachment_name;
			}
		}

		//SETTING OF VALUES IN ARRAY
		this.value_route.length = 0;

		this.value_route.push({
			title: "Control No.",
			value: this.control_no
		});

		this.value_route.push({
			title: "Title",
			value: this.title_view
		});

		this.value_route.push({
			title: "Code",
			value: this.code
		});

		this.value_route.push({
			title: "Type",
			value: this.docType
		});

		this.value_route.push({
			title: "Attachments",
			value: attach
		});

		this.value_route.push({
			title: "Originating Office",
			value: this.value.data[0].originating_office
		});

		this.value_route.push({
			title: "Action Needed",
			value: this.action
		});

		this.value_route.push({
			title: "Remarks",
			value: this.remarks_view
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
	
		doc.setFontSize(10);
        doc.setFont('BookAntiqua');

		doc.addImage(
			img,
			'PNG',
			15,
			10,
			50,
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
			body: body,
			styles: {
				font: 'BookAntiqua',
				fontSize: 12,
				cellPadding: 0.5,
			},
			columnStyles: {
				0: { halign: 'left', cellWidth: 40, fontStyle: 'bold'},
				1: { halign: 'left' }
			},
			didParseCell: (body: any) => {
				if (body.row.index == 4 && body.column.dataKey === '1') {
					body.cell.styles.fontSize = 11; 
				}
			}
		})


		// doc.text('Control No.:', 20, 40);
		// doc.text(`${this.control_no}`, 55, 40);

		// doc.text('Document Title:', 20, 45);
		// doc.text(`${this.title}`, 55, 45);

		// doc.text('Document Code:', 20, 50);
		// if(this.code == null){doc.text('', 55, 50);}
		// else{doc.text(`${this.code}`, 55, 50);}
		
		// doc.text('Document Type:', 20, 55);
		// doc.text(`${this.docType}`, 55, 55);

		// doc.text('Attachment/s:', 20, 60);
		// doc.text(``, 55,60);

		// doc.text('Originating Office:', 20, 65);
		// doc.text(`${this.value.data[0].originating_office}`, 55, 65);

		// doc.text('Created by:', 20, 70);
		// doc.text(`${this.value.data[0].fullname_creator}`, 55, 70);

		// doc.text('Date Created:', 20, 75);
		// doc.text(`${this.value.data[0].date}`, 55, 75);

		const tableY = (doc as any).lastAutoTable.finalY;

		doc.rect(15, tableY + 2, 180, 45, 'S');
		doc.rect(15, tableY + 50, 180, 45, 'S');
		doc.rect(15, tableY + 98, 180, 45, 'S');
		doc.rect(15, tableY + 146, 180, 45, 'S');

		doc.text('REMARKS:      [ ] FOR APPROVAL      [ ] FOR REVISION', 18, tableY + 7);
		doc.text('SPECIFIC INSTRUCTIONS: ', 18, tableY + 12);

		doc.text('REMARKS:      [ ] FOR APPROVAL      [ ] FOR REVISION', 18, tableY + 55);
		doc.text('SPECIFIC INSTRUCTIONS: ', 18, tableY + 60);

		doc.text('REMARKS:      [ ] FOR APPROVAL      [ ] FOR REVISION', 18, tableY + 103);
		doc.text('SPECIFIC INSTRUCTIONS: ', 18, tableY + 108);

		doc.text('REMARKS:      [ ] FOR APPROVAL      [ ] FOR REVISION', 18, tableY + 151);
		doc.text('SPECIFIC INSTRUCTIONS: ', 18, tableY + 156);

		doc.save(`ROUTING SLIP_${control_no}.pdf`);
	}

	async printReceivingSlip(batch_no: string){

		this.value_batch.length = 0;
		this.result_batch = await this.dashboardService.get_batch(batch_no);

		for(let x=0; x<Object.keys(this.result_batch.data).length; x++){

			this.result_attachments = await this.dashboardService.get_attachment_list(this.result_batch.data[x].control_no)
			let attach = '';

			for(let y=0; y<Object.keys(this.result_attachments.data).length; y++){
				
				if(y != Object.keys(this.result_attachments.data).length - 1)
				{
					attach += this.result_attachments.data[y].attachment_name;
					attach += ', ';
				} else {
					attach += this.result_attachments.data[y].attachment_name;
				}
			}

			this.value_batch.push({
				no: x+1,
				control_no: this.result_batch.data[x].control_no,
				document_title: this.result_batch.data[x].document_title,
				document_date: this.result_batch.data[x].date,
				document_type: this.result_batch.data[x].document_type,
				attachment: attach,
				remarks: this.result_batch.data[x].remarks
			});
		}

		const body = this.value_batch.map((batch: {
			no: any;
			control_no: any;
			document_title: any;
			document_type: any;
			attachment: any;
			remarks: any;
		}) => [
			batch.no,
			batch.control_no,
			batch.document_title,
			batch.document_type,
			batch.attachment,
			batch.remarks
		]);

		const doc = new jsPDF('l', 'mm', 'a4');

		doc.setFontSize(15);
        doc.setFont('BookAntiqua');
		doc.text('TECS - Document Tracking System', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
		
		doc.setFontSize(20);
        doc.setFont('BookAntiqua', 'bold');
		doc.text('Routing Slip', doc.internal.pageSize.getWidth() / 2, 27, { align: 'center' });
		
		doc.setFontSize(15);
        doc.setFont('BookAntiqua', 'normal');
		doc.text(`${this.result_batch.data[0].created_at.substring(0, 10)} ${this.formatTime(this.result_batch.data[0].created_at.substring(0, 10), this.result_batch.data[0].created_at.substring(11, 19))}`, doc.internal.pageSize.getWidth() / 2, 34, { align: 'center' });
		
		doc.line(15, 40, 282.5, 40);

		autoTable(doc, {
			startY: 45,
			head: [
				[
					{
						content: 'NO.',
						styles: { halign: 'center', valign: 'middle'}
					},
					{
						content: 'CONTROL NO.',
						styles: { halign: 'center', valign: 'middle'}
					},
					{
						content: 'DOCUMENT TITLE',
						styles: { halign: 'center', valign: 'middle', cellWidth: 80}
					},
					{
						content: 'DOCUMENT TYPE',
						styles: { halign: 'center', valign: 'middle'}
					},
					{
						content: 'ATTACHMENT',
						styles: { halign: 'center', valign: 'middle'}
					},
					{
						content: 'REMARKS',
						styles: { halign: 'center', valign: 'middle'}
					},
					{
						content: 'RECEIVED BY',
						styles: { halign: 'center', valign: 'middle', cellWidth: 40}
					},
				]
			],
			body,
			headStyles: {
				fillColor: [4, 4, 132],
				textColor: 255,           
				fontStyle: 'bold',

				lineWidth: 0.5,
				lineColor: [255, 255, 255]
			},
			styles: {
				font: 'BookAntiqua',
				fontSize: 11,
				cellPadding: 5,
			},
			columnStyles: {
				0: { halign: 'center' },
				1: { halign: 'center' },
				2: { halign: 'left' },
				3: { halign: 'left' },
				4: { halign: 'left' },
				5: { halign: 'left' },
			}
		})

		const tableY = (doc as any).lastAutoTable.finalY;

		// doc.line(130, tableY + 15, 195, tableY + 15);
		// doc.text('Name and Signature', 145, tableY + 20);

		doc.save(`RECEIVING SLIP_${batch_no}.pdf`);
	}


	//OTHERS
	formatTime(date:string, time: string): string{
    
		const datetime = new Date(`${date}T${time}`);

		let result =  datetime.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});

		if(result == 'Invalid Date')
		{return ''} 
		else { return result}
  	}

	reloadPage(){
		location.reload();
	}

	async signOut() {
		swal.fire({
      		title: "Are you sure you want to logout?",
      		icon: "warning",
      		showCancelButton: true,
      		confirmButtonColor: "#3085d6",
      		cancelButtonColor: "#d33",
      		confirmButtonText: "Yes, logout!"
    	}).then((result) => {
      		if (result.isConfirmed) {
        		this.userService.signOut();
        		localStorage.clear();
        		this.router.navigate(['/login']);
      		} else {
        		swal.close();
      		}
   	 	});
  	}

}
