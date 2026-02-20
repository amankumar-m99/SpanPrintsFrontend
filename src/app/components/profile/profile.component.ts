import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth/auth.service';
import { Profile } from '../../model/profile/profile.model';
import { ProfileService } from '../../services/profile/profile.service';
import { ProfilePicComponent } from '../profile-pic/profile-pic.component';
import { Constant } from '../../constant/Constant';
import { AboutComponent } from "../about/about.component";
import { ToastComponent } from "../utility/toast/toast.component";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProfilePicComponent, AboutComponent, ToastComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

  profile!: Profile | null;
  showErrorToast = false;
  showSuccessToast = false;
  errorMessage: string | null = null;

  // account details
  accountDetailsForm!: FormGroup;
  accountDetailsFormValidations!: Validators[];
  editAccount = false;
  accountDetailsLoading = false;
  accountDetailSaving = false;
  accountDetailsErrorMessage: string | null = null;

  // personal details
  personalDetailsForm!: FormGroup;
  personalDetailsFormValidations!: Validators[];
  editPersonal = false;
  personalDetailsLoading = false;
  personalDetailsSaving = false;
  personalDetailsErrorMessage: string | null = null;

  constructor(private authService: AuthService, private profileService: ProfileService, private fb: FormBuilder, private http: HttpClient) { }

  ngOnInit(): void {
    this.accountDetailsLoading = true;
    this.personalDetailsLoading = true;
    this.profile
    this.authService.getCurrentUser().subscribe({
      next: (res) => {
        this.profile = res;
        this.profile.personalDetails.profilePic = Constant.PROFILE_PIC_API_GET_BASR_URL + 'id/' + this.profile.account.uuid;
        this.initAccountDetailsForm();
        this.disableValidations(this.accountDetailsForm);
        this.initPersonalDetailsForm();
        this.disableValidations(this.personalDetailsForm);
        this.accountDetailsLoading = false;
        this.personalDetailsLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load profile.';
        this.accountDetailsLoading = false;
        this.personalDetailsLoading = false;
      }
    });
  }

  initAccountDetailsForm() {
    this.accountDetailsForm = this.fb.group({
      email: [this.profile?.account.email, [Validators.required, Validators.email]],
      username: [this.profile?.account.username, Validators.required],
    });
  }

  initPersonalDetailsForm() {
    this.personalDetailsForm = this.fb.group({
      name: [this.profile?.personalDetails.name, Validators.required],
      birthday: [this.profile?.personalDetails.birthday, Validators.required],
      gender: [this.profile?.personalDetails.gender, Validators.required],
      profilePic: [this.profile?.personalDetails.profilePic]
    });
  }

  enableValidations(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      form.get(key)?.setValidators
      form.get(key)?.updateValueAndValidity();
    });
  }

  disableValidations(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      form.get(key)?.clearValidators();
      form.get(key)?.updateValueAndValidity();
    });
  }

  enableEditAccountDetails() {
    this.editAccount = true;
    this.initAccountDetailsForm();
    this.enableValidations(this.accountDetailsForm);
  }

  enableEditPersonalDetails() {
    this.editPersonal = true;
    this.initPersonalDetailsForm();
    this.enableValidations(this.personalDetailsForm);
  }

  cancelEditAccount() {
    this.editAccount = false;
    this.accountDetailsForm.patchValue({
      ...this.profile?.account
    });
    this.disableValidations(this.accountDetailsForm);
  }

  cancelEditPersonalDetails() {
    this.editPersonal = false;
    this.personalDetailsForm.patchValue({
      ...this.profile?.personalDetails
    });
    this.disableValidations(this.personalDetailsForm);
  }

  // Object.keys(this.accountDetailsForm.controls).forEach(key => {
  //   const control = this.accountDetailsForm.get(key);
  //   if (control) {
  //     control.setErrors(null);       // clear validation errors
  //     control.markAsPristine();      // mark field as pristine
  //     control.markAsUntouched();     // mark field as untouched
  //   }
  // });


  saveAccountDetailsChanges() {
    if (this.accountDetailsForm.invalid) {
      this.accountDetailsForm.markAllAsTouched();
      return;
    }
    this.accountDetailSaving = true;
    this.profileService.updateAccountDetails(this.accountDetailsForm.value).subscribe({
      next: () => {
        if (this.profile != null) {
          this.profile.account.email = this.accountDetailsForm.value.email;
          this.profile.account.username = this.accountDetailsForm.value.username;
        }
        this.editAccount = false;
        this.accountDetailSaving = false;
        this.showSuccessToast = true;
        setTimeout(() => this.showSuccessToast = false, 3000);
      },
      error: (err) => {
        console.log(err);
        this.accountDetailSaving = false;
        this.showErrorToast = true;
        setTimeout(() => this.showErrorToast = false, 3000);
      }
    });
  }

  savePersonalDetailsChanges() {
    if (this.personalDetailsForm.invalid) {
      this.personalDetailsForm.markAllAsTouched();
      return;
    }
    this.personalDetailsSaving = true;
    // Replace with your backend API
    this.profileService.updatePersonalDetails(this.personalDetailsForm.value).subscribe({
      next: () => {
        if (this.profile != null) {
          this.profile.personalDetails.name = this.personalDetailsForm.value.name;
          this.profile.personalDetails.birthday = this.personalDetailsForm.value.birthday;
          this.profile.personalDetails.gender = this.personalDetailsForm.value.gender;
        }
        this.editPersonal = false;
        this.personalDetailsSaving = false;
        this.showSuccessToast = true;
        setTimeout(() => this.showSuccessToast = false, 3000);
      },
      error: () => {
        this.personalDetailsSaving = false;
        this.showErrorToast = true;
        setTimeout(() => this.showErrorToast = false, 3000);
      }
    });
  }
}
