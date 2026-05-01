import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class VerifyEvidenceDto {
  @IsString()
  @IsNotEmpty()
  verifiedBy!: string;

  @IsBoolean()
  isVerified!: boolean;

  @IsString()
  @IsOptional()
  verificationNotes?: string;
}
