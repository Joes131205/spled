import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class assignTaskDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  memberId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  assignedBy?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
