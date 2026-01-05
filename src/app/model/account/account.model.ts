import { Role } from "../role/role.model";

export interface Account {
  uuid: string;
  email: string;
  username: string;
  roles: Role[];
  createdAt: Date
}
