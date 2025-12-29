export interface Customer {
  id: number;
  uuid: string;
  email: string;
  username: string;
  primaryPhoneNumber: string;
  alternatePhoneNumber: string;
  dateAdded: Date;
  addedBy: string;
}