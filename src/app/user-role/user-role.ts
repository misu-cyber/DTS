import { Component, inject, signal, Signal, WritableSignal, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LibrariesService } from '../services/libraries';
import { UserService } from '../services/user';

import swal from 'sweetalert2';

@Component({
	selector: 'app-user-role',
	imports: [FormsModule],
	templateUrl: './user-role.html',
	styleUrl: './user-role.scss',
})

export class UserRole {

  	// DECLARATIONS 
  	// | ----------------------------------------------------------- |
	private readonly librariesService = inject(LibrariesService);
	private readonly userService = inject(UserService);
  	private readonly router = inject(Router);

	constructor(
  		private cdr: ChangeDetectorRef
	) {}

	// VARIABLES 
  	// | ----------------------------------------------------------- |
	result: any;
	value: any;
	users: any;
	employees: any;
	personnel: any;

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
			this.fetchUsers();
		} else {
			this.router.navigate(['/dashboard']);
		}
  	}

	async fetchUsers(){
		this.result = await this.librariesService.get_user_role();
    	this.users = this.result.data;

		this.result = await this.userService.getEmployees();
		this.employees = this.result.data;

		setTimeout(() => {
			$('#tblUserRole').DataTable();
		}, 0);
		this.cdr.detectChanges();
	}

	async addUser(){
		this.result = await this.librariesService.add_user_role(this.personnel, Number(localStorage.getItem('empID')));

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
				text: "User has been added.",
			}).then((result) => {
				if (result.isConfirmed) {
					location.reload();
				}
			});
		}
	}

	async deleteUser(id: number){
		swal.fire({
				title: "Are you sure you want to delete user?",
				icon: "warning",
				showCancelButton: true,
				confirmButtonColor: "#C7383A",
				cancelButtonColor: "gray",
				confirmButtonText: "Yes, delete!"
			}).then((result) => {
			if (result.isConfirmed) {
				this.result = this.librariesService.delete_user_role(id)

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
						text: "User has been deleted.",
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
