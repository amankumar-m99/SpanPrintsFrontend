import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { base64ToFile, ImageCroppedEvent, ImageCropperComponent, LoadedImage } from 'ngx-image-cropper';
import { ProfileService } from '../../services/profile/profile.service';
import { Constant } from '../../constant/Constant';

@Component({
  selector: 'app-profile-pic',
  standalone: true,
  imports: [CommonModule, ImageCropperComponent],
  templateUrl: './profile-pic.component.html',
  styleUrl: './profile-pic.component.css'
})
export class ProfilePicComponent implements AfterViewInit {
  picLoading = false;
  oldPic = "";
  uploadedFile?: File;
  fileName: string = '';
  showModal: boolean = false;
  showErrorToast = false;
  showSuccessToast = false;
  imageChangedEvent: Event | null = null;
  imageCroppedEvent?: ImageCroppedEvent;
  croppedImage: SafeUrl = '';
  fallbackImageUrl = "assets/profile-pic.png";

  @Input("profilePicUrl")
  profilePicUrl: string | undefined;
  @ViewChild('profilePic') profilePic!: ElementRef;

  constructor(private http: HttpClient, private profileService: ProfileService, private sanitizer: DomSanitizer) { }

  ngAfterViewInit(): void {
    this.profilePic.nativeElement.addEventListener("error", (e: any) => {
      this.profilePicUrl = this.fallbackImageUrl;
    });
  }

  onFileChange(event: any): void {
    this.imageChangedEvent = event;
    this.uploadedFile = event.target.files[0];
    this.fileName = this.uploadedFile?.name || '';
    this.showModal = true;
  }

  saveCroppedImage() {
    // if (this.croppedImage) {
    //   this.profilePicUrl = this.croppedImage;
    // }
    //
    let file;
    if (this.imageCroppedEvent && this.imageCroppedEvent.blob != null) {
      file = new File([this.imageCroppedEvent.blob], this.fileName);
    }
    else if (this.uploadedFile) {
      file = this.uploadedFile;
    }
    if (file) {
      this.uploadProfilePicToBackend(file);
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.imageCroppedEvent = event;
    if (typeof event.objectUrl == "string") {
      this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl);
    }
    // event.blob can be used to upload the cropped image
  }
  imageLoaded(image: LoadedImage) {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }

  removeProfilePic() {
    this.profileService.removeProfilePic().subscribe({
      next: (res) => {
        this.showSuccessToast = true;
        setTimeout(() => this.showSuccessToast = false, 3000);
      },
      error: (err) => {
        this.showErrorToast = true;
        setTimeout(() => this.showErrorToast = false, 3000);
      }
    });
  }

  // ✅ Profile picture update with instant preview
  uploadProfilePicToBackend(file: File) {
    if (this.profilePicUrl) {
      this.oldPic = this.profilePicUrl; // backup old pic
    }
    const reader = new FileReader();
    // Show preview instantly
    reader.onload = () => {
      this.profilePicUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
    this.picLoading = true;
    const formData = new FormData();
    formData.append('profile-pic', file);
    this.profileService.updateProfilePic(formData).subscribe({
      next: (res) => {
        this.profilePicUrl = Constant.API_URL + res.url;
        this.picLoading = false;
        this.showSuccessToast = true;
        this.showModal = false;
        setTimeout(() => this.showSuccessToast = false, 3000);
      },
      error: (err) => {
        // Rollback to old pic if upload fails
        // this.personalDetailsForm.patchValue({ profilePic: this.oldPic });
        this.profilePicUrl = this.oldPic;
        this.picLoading = false;
        this.showErrorToast = true;
        setTimeout(() => this.showErrorToast = false, 3000);
      }
    });
  }

  rotateLeft(cropper: any) { cropper.rotateLeft(); }
  rotateRight(cropper: any) { cropper.rotateRight(); }
  flipHorizontal(cropper: any) { cropper.flipHorizontal(); }
  flipVertical(cropper: any) { cropper.flipVertical(); }

}
