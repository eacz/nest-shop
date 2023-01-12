import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product title',
    uniqueItems: true,
    nullable: false,
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({
    description: 'Product price',
    default: 0,
    nullable: true,
  })
  @IsNumber()
  @IsOptional()
  @IsPositive()
  price?: number;

  @ApiProperty({
    description: 'Product description',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    nullable: true,
    uniqueItems: true,
    description: 'slug for ceo and routing',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    nullable: true,
    default: 0,
    description: 'Initial Stock of product',
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  @ApiProperty({
    description: 'Sizes of the product',
  })
  @IsString({ each: true })
  @IsArray()
  sizes: string[];

  @ApiProperty({
    description: 'Gender of the product',
  })
  @IsIn(['men', 'women', 'kid', 'unisex'])
  gender: string;

  @ApiProperty({
    description: 'Tag for quick search or group items',
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags: string[];

  @ApiProperty({
    description: 'images of the product',
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images: string[];
}
