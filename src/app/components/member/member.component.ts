import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { CommonService } from '@app/shared/_services/common.service';
import { MemberService } from './service/member.service';

declare const $: any;

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss']
})
export class MemberComponent implements OnInit {

  users: any[] = [];
  roles: any[] = [];
  departments: any[] = [];
  subscriptions: any[] = [];
  checkFormType: string = "CREATE";
  submitted: boolean = false;
  submitFlag = false;
  showDepartment: boolean = false;
  showRole: boolean = true;
  hideValues: any = ['company admin' , 'billing staff']
  hide: boolean = true

  // ngx-intl-tel-input config
  separateDialCode = true;
	SearchCountryField = SearchCountryField;
	CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
	preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.India, CountryISO.Canada];

  inviteForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.blank_space)]],
    email: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.email)]],
    subscriptionId: ['', Validators.required],
    mobile: [{}, Validators.required],
    roleId: ['', Validators.required]
  });

  get form() { return this.inviteForm.controls; }

  constructor(
    private _memberService: MemberService,
    private fb: FormBuilder,
    private _commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.getAllInvites();

    this._memberService.getRoles().subscribe(data => {
      if(data){
        let updatedRoles = data.data.map((x: any) => {
          let newObj = {
            ...x,
            name: x.name.split("_").join(" ")
          };
          return newObj;
        })
        this.roles = updatedRoles;
      }
    }, err => {
      console.log(err);
    });

    this._memberService.getDepartments().subscribe(data => {
      if(data){
        this.departments = data;
      }
    }, err => {
      console.log(err);
    });

    this._memberService.getSubscriptions().subscribe(data => {
      if(data){
        this.subscriptions = data;
      }
    }, err => {
      console.log(err);
    });
  }

  // Get all invites users
  getAllInvites() {
    this._memberService.getAllInvites({ userId: this._commonService.getUserId()}).subscribe(
      (response: any) => {
        this.users = response.data[0].data;
      },
      (error: any) => { }
    );
  }

  setFormType(type: string, data?: any){
    if (type == 'CREATE') {
      this.showRole = true;
      this.checkFormType = type;
      this.inviteForm.patchValue({
        fullName: "",
        email: "",
        subscriptionId: "",
        mobile: "",
        roleId: "",
        departmentId: "",
      });
    }
    else {
      this.checkFormType = type;
      this.showRole = false;
      this.inviteForm.removeControl("roleId");
      if (!data.departmentId) this.inviteForm.removeControl("departmentId");
      else this.inviteForm.addControl("departmentId", this.fb.control('', [Validators.required]));
      this.inviteForm.patchValue({
        fullName: data.fullName ? data.fullName : '',
        email: data.email ? data.email : '',
        subscriptionId: data.subscriptionId ? data.subscriptionId : '',
        mobile: data.mobile ? data.mobile : {},
        // roleId: data.roleId ? data.roleId : '',
        departmentId: data.departmentId ? data.departmentId : '',
      });
    }
  }

  handleDepartment(event: any) {
    let role = this.roles.filter(x => x.id == event.target.value);
    if (role[0].name === "billing staff" || role[0].name === "company admin") {
      this.showDepartment = false;
      this.inviteForm.removeControl("departmentId");
    } else {
      this.showDepartment = true;
      this.inviteForm.addControl("departmentId", this.fb.control('', [Validators.required]));
    }
  }
  
  // Submit user data
  onSubmit() {
    this.submitted = true;
    
    if (this.inviteForm.valid) {

      this.submitFlag = true;
      this.inviteForm.value.creatorId = this._commonService.getUserId();
      
      // When new user create
      if (this.checkFormType === "CREATE") {
        this._memberService.invite({ data: this.inviteForm.value }).subscribe(
          (response: any) => {
            this.resetFormModal();
            this.getAllInvites();
            this._commonService.successToaster("Member invited successfully!");
          },
          (error: any) => {
            if (error.status === 422 && error.error.error.details.codes.email[0] === "uniqueness") {
              this._commonService.errorToaster("Email is already registered, please try with a different one");
            }
          }
        ).add(() => this.submitFlag = false );
      }
      // When update any existing user
      else if (this.checkFormType === "UPDATE") {
        this._memberService.updateUser(this.inviteForm.value, this._commonService.getUserId(), this._commonService.getSession().token).subscribe(
          (response: any) => {
            this.resetFormModal();
            this.getAllInvites();
            this._commonService.successToaster("Member updated successfully!");
          },
          (error: any) => {
            if (error.status === 422 && error.error.error.details.codes.email[0] === "uniqueness") {
              this._commonService.errorToaster("Email is already registered, please try with a different one");
            }
          }
        ).add(() => this.submitFlag = false );
      }
    }
  }
  // Clear modal validation when close
  resetFormModal () {
    this.inviteForm.reset();
    this.submitted = false;
    this.showDepartment = false;
    this.inviteForm.removeControl("departmentId");
    $('#member_modal').modal('hide');
  }
}

