export interface Customer {
  uuid: string;
  dbid: number;
  email: string;
  username: string;
  primaryPhoneNumber: string;
  alternatePhoneNumber: string;
  createdAt: Date
}