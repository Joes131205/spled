import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateEvidenceDto {
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  @ApiProperty({ example: 'https://google.com' })
  fileUrl!: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Done with the task A with...' })
  description?: string;
}
