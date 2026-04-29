import { IsNotEmpty, IsString } from 'class-validator';

export class createLogReasonDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
