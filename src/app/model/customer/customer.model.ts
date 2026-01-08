export interface Customer {
  id: number;
  uuid: string;
  name: string;
  email: string;
  address: string;
  primaryPhoneNumber: string;
  alternatePhoneNumber: string;
  createdAt: string;
  createdBy: string;
  createdByAccountId: number;
  printJobIds: number[];
}