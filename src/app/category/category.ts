import { Component, inject, signal, Signal, WritableSignal, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LibrariesService } from '../services/libraries';

import swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-category',
  imports: [FormsModule, CommonModule],
  templateUrl: './category.html',
  styleUrl: './category.scss',
})

export class Category implements OnInit{

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
	categories: any;

	category_id: any;
	category_name: any;

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
			this.fetchCategories();
		} else {
			this.router.navigate(['/dashboard']);
		}
  	}

	async fetchCategories(){
    	this.result = await this.librariesService.get_categories();
    	this.categories = this.result.data;
		setTimeout(() => {
			$('#tblCategories').DataTable();
		}, 0);
		this.cdr.detectChanges();
  	}

	async addCategory(){
		this.result = await this.librariesService.add_category({
			category_name: this.category_name,
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
				text: "Category has been added.",
			}).then((result) => {
				if (result.isConfirmed) {
					location.reload();
				}
			});
		}
	}

	async updateCategory(){
		this.result = await this.librariesService.update_category({
			id: this.category_id,
			category_name: this.category_name,
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
				text: "Category has been updated.",
			}).then((result) => {
				if (result.isConfirmed) {
					location.reload();
				}
			});
		}

	}

	async showCategory(id: number){
		this.value = Object.values(this.categories).find((x : any) => x.id == id)

		this.category_id = this.value.id;
		this.category_name = this.value.category_name;
	}
	
	async deleteCategory(id: number){
    	swal.fire({
				title: "Are you sure you want to delete item?",
				icon: "warning",
				showCancelButton: true,
				confirmButtonColor: "#C7383A",
				cancelButtonColor: "gray",
				confirmButtonText: "Yes, delete!"
    		}).then((result) => {
      		if (result.isConfirmed) {
        		this.result = this.librariesService.delete_category(id)

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
						text: "Category has been deleted.",
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
