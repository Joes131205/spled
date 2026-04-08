import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async register(body: any) {
    console.log(body);
  }

  async login(body: any) {
    console.log(body);
  }

  async getMe() {
    console.log('Get me');
  }
}
