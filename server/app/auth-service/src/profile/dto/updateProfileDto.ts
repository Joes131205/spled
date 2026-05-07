import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ required: false, example: 'johndoe' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ required: false, example: 'johndoe@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false, example: 'NewStrongPassword123!' })
  @IsOptional()
  @IsString()
  password?: string;
}
