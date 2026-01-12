import { PartialType } from '@nestjs/mapped-types';
import { CreateExamDto } from './create-exam.dto';
import { IsEnum, IsOptional } from 'class-validator';

export enum ExamStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export class UpdateExamDto extends PartialType(CreateExamDto) {
  @IsOptional()
  @IsEnum(ExamStatus)
  status?: ExamStatus;
}
