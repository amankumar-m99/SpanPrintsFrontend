import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth/auth.service';
import { Profile } from '../../model/profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profile!: Profile | null;
  profileForm!: FormGroup;
  editMode = false;
  loading = false;       // for form save
  picLoading = false;    // for profile picture upload
  showToast = false;
  showErrorToast = false;
  oldPic = "";           // to rollback on failure
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private fb: FormBuilder, private http: HttpClient) { }

  ngOnInit(): void {
    this.loading = true;
    this.authService.getCurrentUser().subscribe({
      next: (res) => {
        this.profile = res;
        this.initProfileForm();
        this.loading = false;
      },
      error: (err) => {
        console.log(err);
        this.errorMessage = 'Failed to load profile.';
        this.loading = false;
      }
    });
  }

  initProfileForm(): void {
    this.profileForm = this.fb.group({
      email: [this.profile?.account.email, [Validators.required, Validators.email]],
      username: [this.profile?.account.username, Validators.required],
      name: [this.profile?.personalDetails.name, Validators.required],
      birthday: [this.profile?.personalDetails.birthday, Validators.required],
      gender: [this.profile?.personalDetails.gender, Validators.required],
      profilePic: [this.profile?.personalDetails.profilePic]
    });
  }

  enableEdit() {
    this.editMode = true;
  }

  cancelEdit() {
    this.editMode = false;
    this.profileForm.patchValue({
      ...this.profile?.account,
      ...this.profile?.personalDetails
    });
  }

  // ✅ Profile picture update with instant preview
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.oldPic = this.profileForm.value.profilePic; // backup old pic
    const reader = new FileReader();

    // Show preview instantly
    reader.onload = () => {
      this.profileForm.patchValue({ profilePic: reader.result as string });
    };
    reader.readAsDataURL(file);

    this.picLoading = true;

    const formData = new FormData();
    formData.append('profilePic', file);

    // Replace with your backend API
    this.http.post<{ imageUrl: string }>('http://localhost:8080/api/profile/upload-pic', formData)
      .subscribe({
        next: (res) => {
          // this.profile?.personalDetails?.profilePic = res.imageUrl;
          this.profileForm.patchValue({ profilePic: res.imageUrl });
          this.picLoading = false;
          this.showToast = true;
          setTimeout(() => this.showToast = false, 3000);
        },
        error: () => {
          // Rollback to old pic if upload fails
          this.profileForm.patchValue({ profilePic: this.oldPic });
          this.picLoading = false;
          alert("Failed to upload profile picture.");
        }
      });
  }

  saveChanges() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    // Replace with your backend API
    this.http.put('http://localhost:8080/api/profile/update', this.profileForm.value)
      .subscribe({
        next: () => {
          if(this.profile != null){
            this.profile.account.email = this.profileForm.value.email;
            this.profile.account.username = this.profileForm.value.username;
            this.profile.personalDetails.name = this.profileForm.value.name;
            this.profile.personalDetails.birthday = this.profileForm.value.birthday;
            this.profile.personalDetails.gender = this.profileForm.value.gender;
          }
          this.editMode = false;
          this.loading = false;
          this.showToast = true;
          setTimeout(() => this.showToast = false, 3000);
        },
        error: () => {
          this.loading = false;
          this.showErrorToast = true;
          setTimeout(() => this.showErrorToast = false, 3000);
        }
      });
  }
}
