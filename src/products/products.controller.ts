import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { validRoles } from 'src/auth/interfaces';
import { User } from 'src/auth/entities/auth.entity';
import { Product } from './entities/product.entity';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth(validRoles.superUser)
  @ApiResponse({
    status: 201,
    description: 'Product was created successfully',
    type: Product,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (Missing data or duplicated properties)',
  })
  @ApiResponse({ status: 403, description: 'Forbidden. (Token Related)' })
  async create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: User,
  ) {
    return this.productsService.create(createProductDto, user);
  }

  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: Product,
  })
  @ApiResponse({ status: 403, description: 'Forbidden. (Token Related)' })
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: Product,
  })
  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.productsService.findOne(term);
  }

  @ApiResponse({
    status: 200,
    description: 'Product was updated successfully',
    type: Product,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (Missing data or duplicated properties)',
  })
  @ApiResponse({ status: 403, description: 'Forbidden. (Token Related)' })
  @ApiResponse({ status: 404, description: 'Not Found (Invalid id)' })
  @Patch(':id')
  @Auth(validRoles.superUser)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User,
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @ApiResponse({
    status: 200,
    description: 'Product was delted successfully',
    type: null,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. (Token or User Role Related)',
  })
  @ApiResponse({ status: 404, description: 'Not Found (Invalid id)' })
  @Delete(':id')
  @Auth(validRoles.superUser)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
