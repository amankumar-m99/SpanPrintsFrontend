export interface Vendor {
  uuid: string;
  name: string;
  email?: string;
  primaryPhoneNumber: string;
  alternatePhoneNumber?: string;
  address?: string;
  dateAdded: Date;
  addedBy: string;
}
