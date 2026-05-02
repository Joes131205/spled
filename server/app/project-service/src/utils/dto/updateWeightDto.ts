import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum TaskWeight {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export class updateWeightDto {
  @ApiProperty({ enum: TaskWeight })
  @IsEnum(TaskWeight)
  @IsNotEmpty()
  weight!: TaskWeight;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  changedBy?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
