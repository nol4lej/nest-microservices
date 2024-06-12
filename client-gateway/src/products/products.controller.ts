import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { PaginationDto } from 'src/common';
import { PRODUCT_SERVICE } from 'src/config';
import { CreateProductDto, UpdateProductDto } from './dto'


@Controller('products')
export class ProductsController {
  
  // Inyecta el cliente de servicios de productos como dependencia, 
  // permitiendo la comunicación con otros microservicios.
  // private readonly aseguran que productsClient sea inmutable y accesible solo dentro de 'ProductsController'
  constructor(
    @Inject(PRODUCT_SERVICE) private readonly productsClient: ClientProxy
  ) {}

  @Post()
  createProduct( @Body() createProductDto: CreateProductDto ){
    return this.productsClient.send({ cmd: 'create_product'}, createProductDto)
  }

  @Get()
  findAllProducts( @Query() paginationDto: PaginationDto ){
    return this.productsClient.send({ cmd: 'find_all_products'}, paginationDto)
  }
  
  @Get(':id')
  async findOneProduct( @Param('id') id: number ){

    // OPCION 1: con observables
    return this.productsClient.send({ cmd: 'find_one_product'}, { id })
      .pipe(
        catchError(err => { throw new RpcException(err)})
      )

    // OPCION 2: con promesas
    // try {
    //   const product = await firstValueFrom( // firstValueFrom toma un Observable y devuelve una promesa que se resuelve con el primer valor emitido por el Observable
    //     this.productsClient.send({ cmd: 'find_one_product'}, { id }) // <- Observable como argumento
    //   );

    //   return product;

    // } catch (error) {
    //   throw new RpcException(error)
    // }

  }

  @Patch(':id')
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto 
  ) {
    return this.productsClient.send({ cmd: 'update_product'}, {
      id,
      ... updateProductDto // spread para enviar las propiedades del body (name, price) mas el id, de esta manera el UpdateProductDto del Product-MS capturará id, name y price.
    }).pipe(
      catchError(err => { throw new RpcException(err)})
    )
  }

  @Delete(':id')
  removeProduct( @Param('id') id: number ){
    return this.productsClient.send({ cmd: 'delete_product'}, { id })
      .pipe(
        catchError(err => { throw new RpcException(err)})
      )
  }

}
