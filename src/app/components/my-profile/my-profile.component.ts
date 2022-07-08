import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonService } from '@app/shared/_services/common.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProfileService } from './service/profile.service';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';

declare const $: any;

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();

  user: any;
  company: any;
  isLoading: boolean = false;

  // User Image variables
  profileImageFile: any;
  profileImage = {
    fileImageUrl: "",
    oldImage: "",
    newImage: "",
    fileUploading: false
  }

  companyLogoFile: any;
  companyLogo = {
    fileImageUrl: "",
    oldImage: "",
    newImage: "",
    fileUploading: false
  }

  // ngx-intl-tel-input config
  separateDialCode = true;
	SearchCountryField = SearchCountryField;
	CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
	preferredCountries: CountryISO[] = [CountryISO.Canada, CountryISO.UnitedStates, CountryISO.India];

  // Profile form
  submitted: boolean = false;
  submitFlag: boolean = false;

  profileForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]], // Validtion for blank space
    email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
    mobile: [{value: {}, disabled: true}],
    telephone: [''],
    profilePic: [''],
    street: ['', Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)], // Validtion for blank space
    city: ['', Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)], // Validtion for blank space
    state: ['', Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)], // Validtion for blank space
    postal_code: ['', Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)], // Validtion for blank space
    country: ['', Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)], // Validtion for blank space
  });
  get form() { return this.profileForm.controls; }

  // Company form

  departments: any = [];
  employeesRanges: any = [];
  companySubmitted: boolean = false;
  companySubmitFlag: boolean = false;

  companyForm = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]], // Validtion for blank space
    job_title: ['', [Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]], // Validtion for blank space
    logo: [''],
    departmentId: ['', Validators.required],
    employeesRangeId: ['', Validators.required]
  });
  get comp_form() { return this.companyForm.controls; }

  // phone number form group
  verifyButtonFlag: boolean = false;
  resendButtonSubmitFlag: boolean = false;
  verifyButtonSubmitFlag: boolean = false;
  numberType: string = "";
  phoneNumberForm = this.fb.group({
    mobile: [{}],
    code: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]]
  });
  get phoneForm() { return this.phoneNumberForm.controls; }

  constructor(private fb: FormBuilder, private _profileService: ProfileService, public _commonService: CommonService) { }

  ngOnInit(): void {
    this.getUserProfile();
    this.getDepartments();
    this.getEmployeesRanges();
  }

  setRegion() {
    this.user.region = 'N/A';
    if (this.user.country && this.user.state) {
        this.user.region = this.user.state + ' / ' + this.user.country;
    } else {
      if (this.user.state) this.user.region = this.user.state;
      if (this.user.country) this.user.region = this.user.country;
    }
  }

  getUserProfile() {
    this.isLoading = true;
    this._profileService.getProfile(this._commonService.getUserId()).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this.user = response;
        this.setRegion();

        this.profileForm.patchValue({
          fullName: this.user.fullName,
          email: this.user.email,
          mobile: this.user.mobile,
          telephone: this.user.telephone,
          street: this.user.street,
          city: this.user.city,
          state: this.user.state,
          postal_code: this.user.postal_code,
          country: this.user.country
        });

        // Set profile pic variables
        this.profileImage.oldImage = response.profilePic;
        if (response.profilePic) {
          this.profileImage.fileImageUrl = `${this._commonService.MEDIA_URL}/user/${response.profilePic}`;
        } else this.profileImage.fileImageUrl = "assets/img/avatar.png";

        this.profileForm.controls["email"].disable();
        if (this.user.mobileVerified) this.numberType = "Change";
        else this.numberType = "Verify";
        this.getCompanyProfile();
      },
      (error: any) => {
        this.isLoading = false;
      }
    );
  }

  getDepartments() {
    this._profileService.getDepartments().pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this.departments = response;
      },
      (error: any) => { }
    );
  }
  getEmployeesRanges() {
    this._profileService.getEmployeesRanges().pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this.employeesRanges = response;
      },
      (error: any) => { }
    );
  }

  getCompanyProfile() {
    this._profileService.getCompanyByUser(this.user.id).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this.company = response;
        this.companyForm.patchValue({
          name: this.company.name,
          job_title: this.company.job_title ? this.company.job_title : "",
          departmentId: this.company.departmentId ? this.company.departmentId : "",
          employeesRangeId: this.company.employeesRangeId ? this.company.employeesRangeId : ""
        });
        // Set company logo variables
        this.companyLogo.oldImage = response.logo;
        if (response.logo) {
          this.companyLogo.fileImageUrl = `${this._commonService.MEDIA_URL}/company/${response.logo}`;
        } else this.companyLogo.fileImageUrl = "assets/img/kpi-karta-logo.png";
      },
      (error: any) => { }
    );
  }

  // Upload profile
  uploadProfile(event: any) {
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].type == "image/jpeg" || event.target.files[0].type == "image/jpg" || event.target.files[0].type == "image/png") {
        if ((event.target.files[0].size / 1024 / 1024) > 20) {
          alert("File must not be greater than 20MB");
          event.target.value = "";
        }
        else {
          this.profileImageFile = <File>event.target.files[0];
          let reader = new FileReader();

          reader.readAsDataURL(event.target.files[0]); // read file as data url
          reader.onload = (event: any) => {           // called once readAsDataURL is completed 
            this.profileImage.fileImageUrl = event.target.result;
            this.profileImage.fileUploading = true;
            const imageData = new FormData();
            imageData.append('photo', this.profileImageFile, this.profileImageFile.name);
            this._profileService.uploadFile(imageData, 'user').pipe(takeUntil(this.destroy$)).subscribe(
              (response: any) => {
              this.profileImage.newImage = response.result.files.photo[0].name;
              this.profileImage.fileUploading = false;
              },
              (error: any) => {}
            );
          }
        }
      } else {
        alert("File must be JPEG, JPG or PNG only.");
        event.target.value = "";
      }
    } else {
      alert("File not found!");
      event.target.value = "";
    }
  }

  // Upload company logo
  uploadCompanyLogo(event: any) {
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].type == "image/jpeg" || event.target.files[0].type == "image/jpg" || event.target.files[0].type == "image/png") {
        if ((event.target.files[0].size / 1024 / 1024) > 20) {
          alert("File must not be greater than 20MB");
          event.target.value = "";
        }
        else {
          this.companyLogoFile = <File>event.target.files[0];
          let reader = new FileReader();

          reader.readAsDataURL(event.target.files[0]); // read file as data url
          reader.onload = (event: any) => {           // called once readAsDataURL is completed 
            this.companyLogo.fileImageUrl = event.target.result;
            this.companyLogo.fileUploading = true;
            const imageData = new FormData();
            imageData.append('photo', this.companyLogoFile, this.companyLogoFile.name);
            this._profileService.uploadFile(imageData, 'company').pipe(takeUntil(this.destroy$)).subscribe(
              (response: any) => {
              this.companyLogo.newImage = response.result.files.photo[0].name;
              this.companyLogo.fileUploading = false;
              },
              (error: any) => {}
            );
          }
        }
      } else {
        alert("File must be JPEG, JPG or PNG only.");
        event.target.value = "";
      }
    } else {
      alert("File not found!");
      event.target.value = "";
    }
  }

  // On submit
  onSubmit() {

    this.submitted = true;

    if (this.profileForm.valid) {

      if (this.profileImage.fileUploading) this._commonService.errorToaster('Please wait! While the file is uploading.');
      else {
        const result = confirm('Are you sure, you want to update your profile?');
        if (result) {

          if (this.profileImage.newImage) {
            this.profileForm.value.profilePic = this.profileImage.newImage;
            this.profileForm.value.oldImage = this.profileImage.oldImage;
          } else {
            this.profileForm.value.oldImage = "";
            this.profileForm.value.profilePic = this.profileImage.oldImage;
          }

          this.submitFlag = true;

          this.profileForm.value.email = this.profileForm.getRawValue().email;
          this.profileForm.value.mobile = this.profileForm.getRawValue().mobile;
  
          let userId = this._commonService.getUserId();
          this._profileService.updateProfile(this.profileForm.value, userId).pipe(takeUntil(this.destroy$)).subscribe(
            (response: any) => {
              this.user = response;
              this.setRegion();
              this._commonService.updateUserNameInSession(this.profileForm.value.fullName);
              this._commonService.updateUserImageInSession(this.profileImage.newImage);
              this._commonService.successToaster("Profile updated successfully");
            },
            (error: any) => { }
          ).add(() => this.submitFlag = false ); 
        }
      }
    }
  }

  // On company submit
  onCompanySubmit() {

    this.companySubmitted = true;

    if (this.companyForm.valid) {

      if (this.companyLogo.fileUploading) this._commonService.errorToaster('Please wait! While the file is uploading.');
      else {
        const result = confirm('Are you sure, you want to update your company details?');
        if (result) {

          if (this.companyLogo.newImage) {
            this.companyForm.value.logo = this.companyLogo.newImage;
            this.companyForm.value.oldCompanyLogo = this.companyLogo.oldImage;
          } else {
            this.companyForm.value.oldCompanyLogo = "";
            this.companyForm.value.logo = this.companyLogo.oldImage;
          }

          this.companySubmitFlag = true;
  
          this._profileService.updateCompany(this.companyForm.value, this.company.id).pipe(takeUntil(this.destroy$)).subscribe(
            (response: any) => {
              this._commonService.updateCompanyLogoInSession(this.companyLogo.newImage);
              this._commonService.successToaster("Company details updated successfully");
            },
            (error: any) => { }
          ).add(() => this.companySubmitFlag = false );
        }
      }
    }
  }

  resetModal(mobileNumber: any) {
    this.phoneNumberForm.reset();
    this.verifyButtonFlag = false;
    this.verifyButtonSubmitFlag = false;
    this.resendButtonSubmitFlag = false;
    this.profileForm.patchValue({ mobile: mobileNumber});
    this.phoneNumberForm.patchValue({ mobile: mobileNumber});
  }

  sendCode() {
    this.resendButtonSubmitFlag = true;
    const data = {
      type: "updateProfile",
      mobile: this.phoneNumberForm.value.mobile
    }
    this._profileService.sendMobileCode(data).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this._commonService.successToaster("Code sent successfully");
        this.verifyButtonFlag = true;
      },
      (error: any) => { }
    ).add(() => this.resendButtonSubmitFlag = false );
  }

  verifyCode() {
    this.verifyButtonSubmitFlag = true;
    const phoneNumber = this.phoneNumberForm.value.mobile;
    this._profileService.verifyMobile(this.phoneNumberForm.value).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        $('#phoneModal').modal('hide');
        this._commonService.successToaster("Mobile verified successfully");
        this.numberType = "Change";
        this.resetModal(phoneNumber);
      },
      (error: any) => { }
    ).add(() => this.verifyButtonSubmitFlag = false );
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
