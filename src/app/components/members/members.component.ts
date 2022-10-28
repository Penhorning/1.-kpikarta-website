import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubscriptionService } from '@app/shared/_services/subscription.service';
import { SignupService } from '../sign-up/service/signup.service';
import { DepartmentService } from './service/department.service';
import { RolesService } from './service/roles.service';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { CommonService } from '@app/shared/_services/common.service';

declare const $: any;

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnInit {
  usersData: any[] = [];
  rolesData: any[] = [];
  departmentsData: any[] = [];
  licenseData: any[] = [];
  inviteGroup: FormGroup | any = [];
  checkFormType: string = "Invite";
  submitted: boolean = false;
  hideDepartment: boolean = false;
  hideValues: any = ['company admin' , 'billing staff']
  hide: boolean = true

  // ngx-intl-tel-input config
  separateDialCode = true;
	SearchCountryField = SearchCountryField;
	CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
	preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.India, CountryISO.Canada];

  constructor(
    private _signupService: SignupService, 
    private _departmentService: DepartmentService, 
    private _fb: FormBuilder, 
    private _subscriptionService: SubscriptionService,
    private _rolesService: RolesService,
    private _commonService: CommonService
    ) {}

  ngOnInit(): void {
    this.inviteGroup = this._fb.group({
      fullName: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.blank_space)]],
      email: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.email)]],
      license: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.blank_space)]],
      role: ['', Validators.required],
      department:  [this.ageRangeValidator(this.hideDepartment)],
      
      type: ['invite'],
      creatorId: [this._commonService.getUserId()]
    });
console.log('this.inviteGroupt',this.inviteGroup);

    this._signupService.getUers().subscribe(data => {
      if(data || data.length > 0){
        this.usersData = data;
      }
    }, err => {
      console.log(err);
    });

    this._rolesService.getRoles().subscribe(data => {
      if(data){
        let updatedRoles = data.data.map((x: any) => {
          let newObj = {
            ...x,
            name: x.name.split("_").join(" ")
          };
          return newObj;
        })
        this.rolesData = updatedRoles;
      }
    }, err => {
      console.log(err);
    });

    this._departmentService.getDepartments().subscribe(data => {
      if(data){
        this.departmentsData = data;
      }
    }, err => {
      console.log(err);
    });

    this._subscriptionService.getSubscriptions().subscribe(data => {
      if(data){
        this.licenseData = data;
      }
    }, err => {
      console.log(err);
    });
  }

  get form() { return this.inviteGroup.controls; }

 ageRangeValidator(val: any){
  return function (control: AbstractControl){
    if(!control.value && !val)
    {
      return {required: true}
    }
    return null
  };
  
}


  setFormType(type: string, data?: any){
    if(type == 'Invite'){
      this.checkFormType = type;
      this.inviteGroup.patchValue({
        fullName: "",
        email: "",
        license: "",
        mobile: "",
        role: "",
        department: "",
      });
    }
    else {
      this.checkFormType = type;
      this.inviteGroup.patchValue({
        fullName: data.fullName ? data.fullName : '',
        email: data.email ? data.email : '',
        license: data.license ? data.license : '',
        mobile: data.mobile ? data.mobile : {},
        role: data.role ? data.role : '',
        department: data.department ? data.department : '',
      });
    }
  }

  handleDepartment(event: any){
   
    let roleValue = this.rolesData.filter(x => x.id == event.target.value);
    this.hideValues.includes(roleValue[0].name) ? this.hideDepartment = true : this.hideDepartment = false;
  }
  
  sendInvite(){
    console.log("this.inviteGroup.valid", this.inviteGroup)
    this.submitted = true;
    if(this.inviteGroup.valid){
      this._signupService.signup(this.inviteGroup.value).subscribe(data => {
        if(data){
          $('#memberModal').modal('hide');
          this._commonService.successToaster("Members invited successfully.. !!")
        }
      }, err => {
        if (err.status === 422 && err.error.error.details.codes.email[0] === "uniqueness") {
          this._commonService.errorToaster("Email is already registered, please try with a different one");
        }
      });
    }
    else {
      this.inviteGroup.markAllAsTouched();
    }
  }
  
updateMembers(){
  this.submitted = true;
    if(this.inviteGroup.valid){
      this._signupService.signup(this.inviteGroup.value).subscribe(data => {
        if(data){
          $('#memberModal').modal('hide');
          this._commonService.successToaster("Members invited successfully.. !!")
        }
      }, err => {
        if (err.status === 422 && err.error.error.details.codes.email[0] === "uniqueness") {
          this._commonService.errorToaster("Email is already registered, please try with a different one");
        }
      });
    }
    else {
      this.inviteGroup.markAllAsTouched();
    }
}
}

