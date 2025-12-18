import { IsBoolean, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateProgressDto {
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  lastPosition?: number;
}
