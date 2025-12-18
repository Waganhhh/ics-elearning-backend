import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateNoteDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  timestamp?: number;
}
