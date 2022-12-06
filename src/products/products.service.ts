import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseError } from 'pg';
import { validate as isUUID } from 'uuid';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}
  private readonly logger = new Logger('Products');

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll({ limit = 10, offset = 0 }: PaginationDto) {
    try {
      const products = await this.productRepository.find({
        take: limit,
        skip: offset,
        //TODO relations
      });
      return products;
    } catch (error) {
      this.handleDBExceptions(error);
    }
    return `This action returns all products`;
  }

  async findOne(term: string) {
    let product: Product;

    try {
      if (isUUID(term)) {
        product = await this.productRepository.findOneBy({ id: term });
      } else {
        const query = this.productRepository.createQueryBuilder();
        product = await query
          .where('UPPER(title) = :title or slug = :slug', {
            title: term.toUpperCase(),
            slug: term.toLowerCase(),
          })
          .getOne();
      }

      if (!product) {
        throw new NotFoundException(`Product with id ${term} doesn't exists`);
      }

      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
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
}
