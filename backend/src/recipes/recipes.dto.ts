import { Transform, TransformFnParams } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const trimEach = ({ value }: TransformFnParams): unknown =>
  Array.isArray(value)
    ? value.map((v: unknown) => (typeof v === 'string' ? v.trim() : v))
    : value;

export class GenerateRecipesDto {
  @Transform(trimEach)
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(15)
  @IsString({ each: true })
  @MinLength(2, { each: true })
  @MaxLength(40, { each: true })
  // Only letters, numbers, spaces, hyphens and apostrophes. Blocks prompt-injection style
  // payloads like "ignore previous instructions {...}" and keeps the AI prompt clean.
  @Matches(/^[\p{L}\p{N} '-]+$/u, {
    each: true,
    message:
      "each ingredient may only contain letters, numbers, spaces, - and '",
  })
  ingredients!: string[];
}

export class SaveRecipeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @IsString()
  @MaxLength(500)
  description!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  ingredients!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  steps!: string[];

  @IsInt()
  @Min(1)
  @Max(1440)
  cookTimeMinutes!: number;
  // Note: no imageUrl and no userId here. The server decides those (never trust the client).
}

export class RateRecipeDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;
}
