import { IsUUID, IsNotEmpty } from 'class-validator';

export class AddToCartDto {
  @IsUUID()
  @IsNotEmpty()
  courseId: string;
}
