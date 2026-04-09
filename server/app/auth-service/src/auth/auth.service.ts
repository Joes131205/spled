import { Injectable } from '@nestjs/common';
import { createUserDto } from '../../utils/dto/createUserDto';
import { loginUserDto } from '../../utils/dto/loginUserDto';
import { prisma } from '@spled/shared';

@Injectable()
export class AuthService {
  async register(body: createUserDto) {
    return await prisma.user.create({data: body})
    
  }

  async login(body: loginUserDto) {
    console.log(body);
  }

  async getMe() {
    console.log('Get me');
  }
}
