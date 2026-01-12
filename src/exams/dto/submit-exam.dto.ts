import { IsNotEmpty, IsArray, IsObject } from 'class-validator';

export class SubmitExamDto {
  @IsArray()
  @IsNotEmpty()
  answers: Record<string, any>[];
}
