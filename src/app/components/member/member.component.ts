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

  members: any = [];
  roles: any = [];
  departments: any = [];
  licenses: any = [];
  checkFormType: string = "CREATE";
  currentUser: any;
  submitted: boolean = false;
  submitFlag = false;
  showDepartment: boolean = false;
  hideValues: any = ['company admin', 'billing staff']
  hide: boolean = true;
  viewMore_hide: boolean = true;
  sendingCredentials: boolean = false;

  search_text: string = "";
  totalData: number = 0;
  pageIndex: number = 0;
  pageSize: number = 10;
  loader: any = this._commonService.loader;
  noDataAvailable: any = this._commonService.noDataAvailable;
  loading = false;

  // ngx-intl-tel-input config
  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.India, CountryISO.Canada];

  inviteForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.blank_space)]],
    email: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.email)]],
    licenseId: ['', Validators.required],
    mobile: [{}, Validators.required],
    roleId: ['', Validators.required]
  });

  get form() { return this.inviteForm.controls; }

  constructor(
    private _memberService: MemberService,
    private fb: FormBuilder,
    private _commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.getAllMembers();
    this.getRoles();
    this.getDepartments();
    this.getLicenses();
  }

  // Get all members users
  getAllMembers() {
    let data = {
      page: this.pageIndex + 1,
      limit: this.pageSize,
      userId: this._commonService.getUserId(),
      searchQuery: this.search_text
    }
    this.loading = true;
    this._memberService.getAllMembers(data).subscribe(
      (response: any) => {
        if (response.members[0].data.length > 0) {
          this.members = response.members[0].data;
          this.totalData = response.members[0].metadata[0].total;
        } else {
          this.members = [];
          this.totalData = 0;
        }
      }
    ).add(() => this.loading = false);
  }

  // Get roles
  getRoles() {
    this._memberService.getRoles().subscribe(
      (response: any) => {
        this.roles = response.data;
      }
    );
  }

  // Get departments
  getDepartments() {
    this._memberService.getDepartments().subscribe(
      (response: any) => {
        this.departments = response;
      }
    );
  }

  // Get subscriptions
  getLicenses() {
    this._memberService.getLicenses().subscribe(
      (response: any) => {
        this.licenses = response;
      }
    );
  }

  setFormType(type: string, data?: any) {
    this.checkFormType = type;
    this.currentUser = data;
    if (type == 'CREATE') {
      this.inviteForm.patchValue({
        fullName: "",
        email: "",
        licenseId: "",
        mobile: "",
        roleId: "",
        departmentId: "",
      });
    }
    else {
      if (!data.departmentId) {
        this.showDepartment = false;
        this.inviteForm.removeControl("departmentId");
      } else {
        this.showDepartment = true;
        this.inviteForm.addControl("departmentId", this.fb.control('', [Validators.required]));
        this.inviteForm.patchValue({
          departmentId: data.departmentId ? data.departmentId : ''
        })
      }
      this.inviteForm.patchValue({
        fullName: data.fullName ? data.fullName : '',
        email: data.email ? data.email : '',
        licenseId: data.licenseId ? data.licenseId : '',
        mobile: data.mobile ? data.mobile : {},
        roleId: data.roleId ? data.roleId : '',
      });
    }
  }

  handleDepartment(event: any) {
    let role = this.roles.filter((x: any) => x.id == event.target.value);
    if (role[0].name === "billing staff" || role[0].name === "company admin") {
      this.showDepartment = false;
      this.inviteForm.removeControl("departmentId");
      this.inviteForm.value.departmentId = "";
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
        this._memberService.inviteMember({ data: this.inviteForm.value }).subscribe(
          (response: any) => {
            this.resetFormModal();
            this.members = [];
            this.pageIndex = 0,
            this.viewMore_hide = !this.viewMore_hide;
            this.getAllMembers();
            this._commonService.successToaster("Member invited successfully!");
          },
          (error: any) => {
            if (error.status === 422 && error.error.error.details.codes.email[0] === "uniqueness") {
              this._commonService.errorToaster("Email is already registered, please try with a different one");
            }
          }
        ).add(() => this.submitFlag = false);
      }
      // When update any existing user
      else if (this.checkFormType === "UPDATE") {
        this.inviteForm.value.type = "invited_user";
        this.inviteForm.value.userId = this.currentUser._id;
        this._memberService.updateUser(this.inviteForm.value, this.currentUser._id).subscribe(
          (response: any) => {
            this.resetFormModal();
            this.getAllMembers();
            this._commonService.successToaster("Member updated successfully!");
          },
          (error: any) => {
            if (error.status === 422 && error.error.error.details.codes.email[0] === "uniqueness") {
              this._commonService.errorToaster("Email is already registered, please try with a different one");
            }
          }
        ).add(() => this.submitFlag = false);
      }
    }
  }
  // Clear modal validation when close
  resetFormModal() {
    this.inviteForm.reset();
    this.submitted = false;
    this.showDepartment = false;
    this.inviteForm.removeControl("departmentId");
    $('#memberModal').modal('hide');
  }

  // Send credential
  sendCredential(userId: string) {
    let data = { userId }
    this.sendingCredentials = true;
    this._memberService.sendCredentials(data).subscribe(
      (response: any) => {
        this._commonService.successToaster("Credentials sent successully!");
      },
      (error: any) => { }
    ).add(() => this.sendingCredentials = false);
  }

  search() {
    if (this.search_text) {
      this.pageIndex = 0;
      this.members = [];
      this.getAllMembers();
    }
  }
  clearSearch() {
    this.search_text = "";
    this.members = [];
    this.getAllMembers();
  }

  viewMore() {
    this.pageIndex++
    let data = {
      page: this.pageIndex + 1,
      limit: this.pageSize,
      userId: this._commonService.getUserId(),
      searchQuery: this.search_text
    }
    this.loading = true;
    this._memberService.getAllMembers(data).subscribe(
      (response: any) => {
        if (response) {
          this.members.push(...response.members[0].data);
          if (response.members[0].metadata[0].total == this.members.length) this.viewMore_hide = !this.viewMore_hide;
        }
      }).add(() => this.loading = false);
  }
}

