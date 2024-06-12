import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from '../../products/dto/create-product.dto';
import { IsNumber, isPositive } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {

    // en gateway no es necesario especificar el id porque no lo vamos a pedir por el body

}
