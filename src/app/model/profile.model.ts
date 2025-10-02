import { Account } from "./account.model";
import { PersonalDetails } from "./personal-details.model";

export interface Profile {
  account: Account,
  personalDetails: PersonalDetails
}
