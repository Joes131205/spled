import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfileService {
  async update(body: any) {
    // TODO
    console.log(body);
  }
}
