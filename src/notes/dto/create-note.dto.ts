import { IsUUID, IsNotEmpty, IsNumber, Min, IsOptional, IsString } from 'class-validator';

export class CreateNoteDto {
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @IsUUID()
  @IsNotEmpty()
  lessonId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  timestamp?: number;
}
