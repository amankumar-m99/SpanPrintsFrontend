import { Role } from "./role.model";

export interface Account {
  UUID: number;
  email: string;
  username: string;
  roles: Role[];
  createdAt: Date
}
