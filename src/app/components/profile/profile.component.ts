import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: any | null = null;
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
        this.user = {
          account: {
            email: res.email,
            username: res.username,
            role: "USER",
            createdAt: "2025-01-15"
          },
          personal: {
            name: "John Doe",
            birthday: "1990-06-15",
            gender: "Male",
            profilePic: "assets/profile.png"
          }
        };
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
      email: [this.user.account.email, [Validators.required, Validators.email]],
      username: [this.user.account.username, Validators.required],
      name: [this.user.personal.name, Validators.required],
      birthday: [this.user.personal.birthday, Validators.required],
      gender: [this.user.personal.gender, Validators.required],
      profilePic: [this.user.personal.profilePic]
    });
  }

  enableEdit() {
    this.editMode = true;
  }

  cancelEdit() {
    this.editMode = false;
    this.profileForm.patchValue({
      ...this.user.account,
      ...this.user.personal
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
          this.user.personal.profilePic = res.imageUrl;
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
          this.user.account.email = this.profileForm.value.email;
          this.user.account.username = this.profileForm.value.username;
          this.user.personal.name = this.profileForm.value.name;
          this.user.personal.birthday = this.profileForm.value.birthday;
          this.user.personal.gender = this.profileForm.value.gender;

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
