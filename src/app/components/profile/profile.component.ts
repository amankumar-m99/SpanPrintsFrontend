import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  user: any;
  personalForm!: FormGroup;
  editMode = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Example static data (in real app, fetch from backend)
    this.user = {
      account: {
        email: "john.doe@example.com",
        username: "johndoe",
        role: "USER",
        createdAt: "2025-01-15"
      },
      personal: {
        name: "John Doe",
        birthday: "1990-06-15",
        gender: "Male",
        profilePic: "assets/profile.jpg"
      }
    };

    this.personalForm = this.fb.group({
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
    this.personalForm.patchValue(this.user.personal); // reset to original values
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.personalForm.patchValue({ profilePic: reader.result });
      };
      reader.readAsDataURL(file);
    }
  }

  saveChanges() {
    if (this.personalForm.invalid) {
      this.personalForm.markAllAsTouched();
      return;
    }

    // Simulate save (replace with API call)
    this.user.personal = this.personalForm.value;
    this.editMode = false;
    alert('Profile updated successfully!');
  }
}
