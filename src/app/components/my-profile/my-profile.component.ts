import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonService } from '@app/shared/_services/common.service';
import { ProfileService } from './service/profile.service';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ActivatedRoute } from '@angular/router';

declare const $: any;

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {

  user: any;
  company: any;
  isLoading: boolean = false;

  // Image variables
  profileImage = {
    fileImageUrl: "",
    oldImage: "",
    newImage: "",
    fileUploading: false
  }
  companyLogo = {
    fileImageUrl: "",
    oldImage: "",
    newImage: "",
    fileUploading: false
  }
  // Cropper variables
  imageChangedEvent: any;
  croppedImage: string = "";
  cropperModel = {
    type: "",
    staticWidth: 0,
    staticHeight: 0
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
    telephone: ['', [Validators.pattern("^[0-9]*$"), Validators.minLength(10), Validators.maxLength(10)]],
    profilePic: [''],
    street: ['', Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)], // Validtion for blank space
    city: ['', Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)], // Validtion for blank space
    state: ['', Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)], // Validtion for blank space
    postal_code: ['', [Validators.minLength(5), Validators.maxLength(6)]],
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
    job_title: ['', [Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]], // Validtion for blank space
    logo: [''],
    departmentId: [''],
    employeesRangeId: ['']
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

  constructor(private fb: FormBuilder, private _profileService: ProfileService, public _commonService: CommonService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getUserProfile();
    this.getDepartments();
    this.getEmployeesRanges();

    this.route.fragment.subscribe(f => {
      const element = document.querySelector("#" + f);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
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
    this._profileService.getProfile(this._commonService.getUserId()).subscribe(
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
    this._profileService.getDepartments().subscribe(
      (response: any) => {
        this.departments = response;
      },
      (error: any) => { }
    );
  }
  getEmployeesRanges() {
    this._profileService.getEmployeesRanges().subscribe(
      (response: any) => {
        this.employeesRanges = response;
      },
      (error: any) => { }
    );
  }

  getCompanyProfile() {
    this._profileService.getCompanyByUser(this.user.id).subscribe(
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

  resetCropModel(type: string, width: number, height: number) {
    this.cropperModel.type = type;
    this.cropperModel.staticWidth = width;
    this.cropperModel.staticHeight = height;
    this.imageChangedEvent = "";
  }
  fileChangeEvent(event: any): void {
    if (!event.target.files && !event.target.files[0]) {
      alert("File not found!");
      event.target.value = "";
    } else if (event.target.files[0].type !== "image/jpeg" && event.target.files[0].type !== "image/jpg" && event.target.files[0].type !== "image/png") {
      alert("File must be JPEG, JPG or PNG only.");
      event.target.value = "";
    } else this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
      this.croppedImage = event.base64 || "";
  }
  base64ToBlob(base64: any, mime: any) {
    mime = mime || '';
    var sliceSize = 1024;
    var byteChars = window.atob(base64);
    var byteArrays = [];

    for (var offset = 0, len = byteChars.length; offset < len; offset += sliceSize) {
        var slice = byteChars.slice(offset, offset + sliceSize);
        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        var byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, {type: mime});
  }
  uploadFile() {
    if (this.cropperModel.type == "company") {
      this.companyLogo.fileImageUrl = this.croppedImage;
      this.companyLogo.fileUploading = true;
    } else {
      this.profileImage.fileImageUrl = this.croppedImage;
      this.profileImage.fileUploading = true;
    }
    const base64ImageContent = this.croppedImage.replace(/^data:image\/(png|jpg);base64,/, "");
    const blob = this.base64ToBlob(base64ImageContent, 'image/png');                
    const formData = new FormData();
    formData.append('photo', blob);
    this._profileService.uploadFile(formData, this.cropperModel.type).subscribe(
      (response: any) => {
      if (this.cropperModel.type == "company") {
        this.companyLogo.newImage = response.result.files.photo[0].name;
        this.companyLogo.fileUploading = false;
      } else {
        this.profileImage.newImage = response.result.files.photo[0].name;
        this.profileImage.fileUploading = false;
      }
      $('#cropperModal').modal('hide');
      this.croppedImage = "";
      },
      (error: any) => {}
    );
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
          
          this._profileService.updateProfile(this.profileForm.value, userId).subscribe(
            (response: any) => {
              this.user = response;
              this.setRegion();
              this._commonService.updateUserNameInSession(this.profileForm.value.fullName);
              if (this.profileImage.newImage) this._commonService.updateUserImageInSession(this.profileImage.newImage);
              this._commonService.successToaster("Profile updated successfully");
              this.profileImage.oldImage = response.profilePic;
              this.resetPictureModal();
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
          this._profileService.updateCompany(this.companyForm.value, this.company.id).subscribe(
            (response: any) => {
              if (this.companyLogo.newImage) this._commonService.updateCompanyLogoInSession(this.companyLogo.newImage);
              this._commonService.successToaster("Company details updated successfully");
              this.companyLogo.oldImage = response.logo;
              this.resetPictureModal();
            },
            (error: any) => { }
          ).add(() => this.companySubmitFlag = false );
        }
      }
    }
  }

  resetPictureModal() {
    this.profileImage.newImage = "";
    this.companyLogo.newImage = "";
    this.croppedImage = "";
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
    this._profileService.sendMobileCode(data).subscribe(
      (response: any) => {
        this._commonService.successToaster("Verification code resend successfully");
        this.verifyButtonFlag = true;
      },
      (error: any) => { }
    ).add(() => this.resendButtonSubmitFlag = false );
  }

  verifyCode() {
    this.verifyButtonSubmitFlag = true;
    const phoneNumber = this.phoneNumberForm.value.mobile;
    this._profileService.verifyMobile(this.phoneNumberForm.value).subscribe(
      (response: any) => {
        $('#phoneModal').modal('hide');
        this._commonService.successToaster("Mobile Number is verified successfully");
        this.numberType = "Change";
        this.resetModal(phoneNumber);
      },
      (error: any) => { }
    ).add(() => this.verifyButtonSubmitFlag = false );
  }
  
}
