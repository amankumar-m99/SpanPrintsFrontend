import { Role } from "./role.model";

export interface Account {
  uuid: string;
  email: string;
  username: string;
  roles: Role[];
  createdAt: Date
}
