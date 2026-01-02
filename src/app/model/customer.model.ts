export interface Customer {
  id: number;
  uuid: string;
  email: string;
  name: string;
  primaryPhoneNumber: string;
  alternatePhoneNumber: string;
  dateAdded: Date;
  addedBy: string;
}