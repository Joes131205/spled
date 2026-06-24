import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
  IsEmail,
} from 'class-validator';

export class TeamMemberDto {
  @ApiProperty({ example: 'Frontend' })
  @IsString()
  @IsNotEmpty()
  task!: string;

  @ApiProperty({ example: 'alex@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'MEDIUM' })
  @IsString()
  @IsNotEmpty()
  difficulty!: string;
}

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

  @ApiProperty({ required: false, type: [TeamMemberDto] })
  @IsOptional()
  @IsArray()
  teamMembers?: TeamMemberDto[];
}
