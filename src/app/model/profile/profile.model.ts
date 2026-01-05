import { Account } from "../account/account.model";
import { PersonalDetails } from "../account/personal-details.model";

export interface Profile {
  account: Account,
  personalDetails: PersonalDetails
}
