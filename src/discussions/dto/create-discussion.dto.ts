import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateDiscussionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @IsUUID()
  @IsOptional()
  lessonId?: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;
}
