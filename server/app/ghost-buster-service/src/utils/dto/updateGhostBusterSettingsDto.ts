import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateGhostBusterSettingsDto {
  @ApiProperty({
    required: false,
    example: '7d',
    description: 'Inactivity threshold used to flag members',
  })
  @IsOptional()
  @IsString()
  inactivityThreshold?: string;
}
