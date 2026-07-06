import { Component, inject, signal, Signal, WritableSignal, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LibrariesService } from '../services/libraries';

import swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-doc-type',
  imports: [FormsModule],
  templateUrl: './doc-type.html',
  styleUrl: './doc-type.scss',
})
export class DocType {

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
	docTypes: any;

	type_id: any;
	type_name: any;

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
			this.fetchDocType();
		} else {
			this.router.navigate(['/dashboard']);
		}
  	}

    async fetchDocType(){
    	this.result = await this.librariesService.get_doc_type();
    	this.docTypes = this.result.data;
		setTimeout(() => {
			$('#tblDocType').DataTable();
		}, 0);
		this.cdr.detectChanges();
  	}

    async addDocType(){
        this.result = await this.librariesService.add_doc_type({
            type_name: this.type_name,
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
                text: "Document Type has been added.",
            }).then((result) => {
                if (result.isConfirmed) {
                    location.reload();
                }
            });
        }
    }

    async updateDocType(){
        this.result = await this.librariesService.update_doc_type({
            id: this.type_id,
            type_name: this.type_name,
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
                text: "Document Type has been updated.",
            }).then((result) => {
                if (result.isConfirmed) {
                    location.reload();
                }
            });
        }
    }  
    
    async showDocType(id: number){
		this.value = Object.values(this.docTypes).find((x : any) => x.id == id)

		this.type_id = this.value.id;
		this.type_name = this.value.type_name;
	}

    async deleteDocType(id: number){
        swal.fire({
                title: "Are you sure you want to delete item?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#C7383A",
                cancelButtonColor: "gray",
                confirmButtonText: "Yes, delete!"
            }).then((result) => {
            if (result.isConfirmed) {
                this.result = this.librariesService.delete_doc_type(id)

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
                        text: "Document Type has been deleted.",
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
