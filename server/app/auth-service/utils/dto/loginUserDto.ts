import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class loginUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
