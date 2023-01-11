import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { DatabaseError } from 'pg';
import { validate as isUUID } from 'uuid';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage } from './entities';
import { User } from 'src/auth/entities/auth.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}
  private readonly logger = new Logger('Products');

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const product = this.productRepository.create({
        ...productDetails,
        user,
        images: images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ),
      });
      await this.productRepository.save(product);
      return { ...product, images };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll({ limit = 10, offset = 0 }: PaginationDto) {
    try {
      const products = await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true,
        },
      });

      return products.map(({ images, ...product }) => ({
        ...product,
        images: images.map((img) => img.url),
      }));
    } catch (error) {
      this.handleDBExceptions(error);
    }
    return `This action returns all products`;
  }

  async findOne(term: string, plainImages = true) {
    let product: Product;

    try {
      if (isUUID(term)) {
        product = await this.productRepository.findOneBy({ id: term });
      } else {
        const query = this.productRepository.createQueryBuilder('product');
        product = await query
          .where('UPPER(title) = :title or slug = :slug', {
            title: term.toUpperCase(),
            slug: term.toLowerCase(),
          })
          .leftJoinAndSelect('product.images', 'productImages')
          .getOne();
      }

      if (!product) {
        throw new NotFoundException(`Product with id ${term} doesn't exists`);
      }
      if (plainImages) {
        return { ...product, images: product.images.map((image) => image.url) };
      } else {
        return product;
      }
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = updateProductDto;
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      const product = await this.productRepository.preload({
        id,
        ...toUpdate,
      });

      if (!product) {
        throw new NotFoundException(`Product with id ${id} doesn't exists`);
      }

      await queryRunner.connect();
      await queryRunner.startTransaction();

      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });

        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      } else {
        product.images = await this.productImageRepository.findBy({
          product: { id },
        });
      }

      product.user = user;
      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release();
      //await this.productRepository.save(product);
      return { ...product, images: product.images.map((image) => image.url) };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    try {
      const product = await this.productRepository.delete(id);
      if (product.affected === 0) {
        throw new NotFoundException(`Product with id ${id} doesn't exists`);
      }
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any) {
    this.logger.error(error);

    if (error instanceof QueryFailedError) {
      const errorData = error.driverError as DatabaseError;
      //duplicated error
      if (errorData.code === '23505') {
        throw new BadRequestException(errorData.detail);
      }
      //id error
      if (errorData.code === '22P02') {
        throw new BadRequestException(`Invalid uuid`);
      }
    }
    throw error;
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
