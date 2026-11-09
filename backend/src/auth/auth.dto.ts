import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class RegisterDto {
  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email!: string;

  // bcrypt only looks at the first 72 bytes, so we cap the length there.
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}

export class LoginDto {
  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email!: string;

  @IsString()
  @MaxLength(72)
  password!: string;
}
