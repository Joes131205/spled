import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum TaskWeight {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export class updateTaskDto {
  @ApiProperty({ example: 'Update login flow', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    required: false,
    example: 'Updated description',
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

  @ApiProperty({ required: false, example: '2026-06-30' })
  @IsOptional()
  @IsDateString()
  deadline?: string;
}
