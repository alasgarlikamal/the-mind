import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { google, Auth } from 'googleapis';
import { AuthenticationService } from '../authentication/authentication.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

 
@Injectable()
export class GoogleAuthService {
  oauthClient: Auth.OAuth2Client;
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly authenticationService: AuthenticationService
  ) {
    const clientID = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
 
    this.oauthClient = new google.auth.OAuth2(
      clientID,
      clientSecret
    );
  }
 
  async authenticate(token: string) {
    const tokenInfo = await this.oauthClient.getTokenInfo(token);
 
    const email = tokenInfo.email;
 
    try {
      const user = await this.usersService.findOneByEmail(email);
 
    } catch (error) {
      if (error.status !== 404) {
        throw new error;
      }
 
      return this.registerUser(token, email);
    }
  }

  async getUserData(token: string) {
    const userInfoClient = google.oauth2('v2').userinfo;
   
    this.oauthClient.setCredentials({
      access_token: token
    })
   
    const userInfoResponse = await userInfoClient.get({
      auth: this.oauthClient
    });
   
    return userInfoResponse.data;
  }

  async registerUser(token: string, email: string) {
    const userData = await this.getUserData(token);
    const createUserDto: CreateUserDto = {
        firstname: userData.name,
        lastname: userData.family_name,
        date_of_birth: userData.

    }
   
    const user = await this.usersService.createWithGoogle(email, name);
   
    return this.handleRegisteredUser(user);
  }
 
  
}