export interface Customer {
  id: number;
  uuid: string;
  email: string;
  name: string;
  primaryPhoneNumber: string;
  alternatePhoneNumber: string;
  addedOn: Date;
  addedBy: string;
  addedByAccountId: number;
  printJobIds: number[];
}