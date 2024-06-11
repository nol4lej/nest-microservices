import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('ProductService')

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto
    })
  }

  async findAll( paginationDto: PaginationDto ) {

    const { page, limit } = paginationDto;

    const totalPages = await this.product.count({
      where: { available: true }
    });
    const lastPage = Math.ceil( totalPages / limit)

    return {
      data: await this.product.findMany({
        skip: ( page - 1 ) * limit,
        take: limit,
        where: {
          available: true
        }
      }),
      meta: { // envio metadata 
        totalPages: totalPages,
        currentPage: page,
        lastPage: lastPage,
      }
    }
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: { 
        id,
        available: true 
      }
    })

    if ( !product ){
      throw new RpcException({
        message: `Product id #${id} not found.`,
        status: HttpStatus.BAD_REQUEST
      })
    }

    return product
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    const { id: __, ...data} = updateProductDto;

    await this.findOne(id);

    return this.product.update({
      where: { id },
      data: data
    });
  }

  async remove(id: number) {

    await this.findOne(id);

    return this.product.update({
      where: { id },
      data: {
        available: false
      }
    })

  }
}
