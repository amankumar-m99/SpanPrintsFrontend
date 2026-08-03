export interface Customer {
  id: number;
  uuid: string;
  name: string;
  email: string;
  address: string;
  primaryPhoneNumber: string;
  alternatePhoneNumber: string;
  note: string;
  updatedAt: string;
  createdAt: string;
  createdBy: string;
  createdById: number;
  printJobIds: number[];
}