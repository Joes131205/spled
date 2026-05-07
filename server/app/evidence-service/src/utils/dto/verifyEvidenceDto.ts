import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class VerifyEvidenceDto {
  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ example: true })
  isVerified!: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'LGTM!' })
  verificationNotes?: string;
}
