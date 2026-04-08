import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfileService {
  async update(body: any) {
    console.log('update user');
    console.log(body);
  }
}
