import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum TaskWeight {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export class createTaskDto {
  @ApiProperty({ example: 'Design login flow' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'project-123' })
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @ApiProperty({
    required: false,
    example: 'Build login screen and auth API integration',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    required: false,
    enum: TaskWeight,
    example: TaskWeight.MEDIUM,
  })
  @IsOptional()
  @IsEnum(TaskWeight)
  weight?: TaskWeight;

  @ApiProperty({ required: false, example: 'member-42' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiProperty({ required: false, example: '2026-05-31' })
  @IsOptional()
  @IsDateString()
  deadline?: string;
}
