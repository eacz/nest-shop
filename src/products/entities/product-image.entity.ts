import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity({ name: 'product_images' })
export class ProductImage {
  @ApiProperty({
    example: '0328ecb1-0c61-4594-b5d6-bcb48cee6df0',
    description: 'Product image Id',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'http://eacz.com/image1.jpg',
    description: 'Product image url',
  })
  @Column('text')
  url: string;

  @ApiProperty({
    example: '0328ecb1-0c61-4594-b5d6-bcb48cee6df0',
    description: 'Product Id related to',
  })
  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  product: Product;
}
