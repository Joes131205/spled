import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class unassignTaskDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  assignedBy?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
