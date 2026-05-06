import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class VerifyEvidenceDto {
  @IsBoolean()
  isVerified!: boolean;

  @IsString()
  @IsOptional()
  verificationNotes?: string;
}
