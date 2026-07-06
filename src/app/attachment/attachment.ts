import { Component, inject, signal, Signal, WritableSignal, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LibrariesService } from '../services/libraries';

import swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-attachment',
  imports: [FormsModule],
  templateUrl: './attachment.html',
  styleUrl: './attachment.scss',
})
export class Attachment implements OnInit {

  	// DECLARATIONS 
  	// | ----------------------------------------------------------- |
	private readonly librariesService = inject(LibrariesService);
  	private readonly router = inject(Router);

	constructor(
  		private cdr: ChangeDetectorRef
	) {}

	// VARIABLES 
  	// | ----------------------------------------------------------- |
	result: any;
	value: any;
	attachments: any;

	attachment_id: any;
	attachment_name: any;

	now: Date = new Date();

	formattedDate: string = new Intl.DateTimeFormat('en-US', {
		timeZone: 'Asia/Manila',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).format(this.now);
		
	formattedTime: string = new Intl.DateTimeFormat('en-US', {
		timeZone: 'Asia/Manila',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false
	}).format(this.now)

	// FUNCTIONS 
  	// | ----------------------------------------------------------- |
	ngOnInit() {
		let user_role = localStorage.getItem('role')

		if(user_role == '1'){
			this.fetchAttachments();
		} else {
			this.router.navigate(['/dashboard']);
		}
  	}

	async fetchAttachments(){
    	this.result = await this.librariesService.get_attachment();
    	this.attachments = this.result.data;
		setTimeout(() => {
			$('#tblAttachment').DataTable();
		}, 0);
		this.cdr.detectChanges();
  	}

	async addAttachment(){
		this.result = await this.librariesService.add_attachment({
			attachment_name: this.attachment_name,
			created_by: Number(localStorage.getItem('empID'))
		});

		if(this.result.error){
		swal.fire({
			icon: "error",
			title: "Error",
			text: "Please try again",
		});
		} else {
			swal.fire({
				icon: "success",
				title: "Added",
				text: "Attachment has been added.",
			}).then((result) => {
				if (result.isConfirmed) {
					location.reload();
				}
			});
		}
	}

	async updateAttachment(){
		this.result = await this.librariesService.update_attachment({
			id: this.attachment_id,
			attachment_name: this.attachment_name,
			modified_by: Number(localStorage.getItem('empID')),
			modified_at: this.formattedDate + ' ' + this.formattedTime
		});

		if(this.result.error){
		swal.fire({
			icon: "error",
			title: "Error",
			text: "Please try again",
		});
		} else {
			swal.fire({
				icon: "success",
				title: "Updated",
				text: "Attachment has been updated.",
			}).then((result) => {
				if (result.isConfirmed) {
					location.reload();
				}
			});
		}
	}

	async showAttachment(id: number){
		this.value = Object.values(this.attachments).find((x : any) => x.id == id)

		this.attachment_id = this.value.id;
		this.attachment_name = this.value.attachment_name;
	}

	async deleteAttachment(id: number){
		swal.fire({
				title: "Are you sure you want to delete item?",
				icon: "warning",
				showCancelButton: true,
				confirmButtonColor: "#C7383A",
				cancelButtonColor: "gray",
				confirmButtonText: "Yes, delete!"
			}).then((result) => {
			if (result.isConfirmed) {
				this.result = this.librariesService.delete_attachment(id)

				if (this.result.error) { 
					swal.fire({
						icon: "error",
						title: "Error",
						text: "Please try again",
					});
				} 
				else {
					swal.fire({
						icon: "success",
						title: "Deleted",
						text: "Attachment has been deleted.",
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

}
