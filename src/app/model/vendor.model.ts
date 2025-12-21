export interface Vendor {
  uuid: string;
  dbid: number;
  vendorName: string;
  email?: string;
  primaryPhone: string;
  alternatePhone?: string;
  address?: string;
  createdAt: Date;
}
