import { Injectable } from '@angular/core';
import { Constant } from '../../constant/Constant';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private profilePicUpdateUrl = Constant.API_URL + '/profile-pics';
  private personalDetailsUpdateUrl = Constant.API_URL + '/personal-detail';
  private accountDetailsUpdateUrl = Constant.API_URL + '/account';

  constructor(private http: HttpClient) { }

  updateProfilePic(data: any) {
    return this.http.post<{ url: string }>(this.profilePicUpdateUrl, data);
  }
  
  removeProfilePic(){
    return this.http.delete<any>(this.profilePicUpdateUrl);
  }

  updateAccountDetails(data: any) {
    return this.http.put<any>(this.accountDetailsUpdateUrl, data);
  }

  updatePersonalDetails(data: any) {
    return this.http.post<any>(this.personalDetailsUpdateUrl, data);
  }

}
