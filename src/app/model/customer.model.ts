export interface Customer {
  id: number;
  uuid: string;
  dbid: number;
  email: string;
  username: string;
  primaryPhoneNumber: string;
  alternatePhoneNumber: string;
  dateAdded: Date;
  addedBy: string;
}