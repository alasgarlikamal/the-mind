import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService, private jwtService: JwtService){}

  async login(loginDto: LoginDto){
    try {
      const user = await this.usersService.findOneByEmail(loginDto.email);
      const isMatch = await bcrypt.compare(loginDto.password, user.password);

      if (!isMatch){
        throw new ForbiddenException('Password is incorrect');
      }

      return {
        access_token: this.jwtService.sign({ email: user.email, sub: user.id})
      }
    } catch (error) {
       throw error;
    }
  }
}
