import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateEvidenceDto {
  @IsString()
  @IsNotEmpty()
  uploadedBy!: string;

  @IsString()
  @IsUrl()
  fileUrl!: string;

  @IsString()
  @IsOptional()
  description?: string;
}
