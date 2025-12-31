export interface Vendor {
  uuid: string;
  vendorName: string;
  email?: string;
  primaryPhone: string;
  alternatePhone?: string;
  address?: string;
  createdAt: Date;
}
