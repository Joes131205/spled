import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class createProjectDto {
  @ApiProperty({ example: 'New campus app' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'leader-123' })
  @IsString()
  @IsNotEmpty()
  leaderId!: string;

  @ApiProperty({ required: false, example: 'Project for the 2026 demo app' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
