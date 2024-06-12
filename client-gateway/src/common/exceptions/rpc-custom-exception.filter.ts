import { Catch, RpcExceptionFilter, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

// https://docs.nestjs.com/microservices/exception-filters
// Atrapa los errores que sean de RpcException. Su uso fue agregado como filtro global en main.ts

@Catch(RpcException)
export class RpcCustomExceptionFilter implements ExceptionFilter{

  catch(exception: RpcException, host: ArgumentsHost) {
    
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const rpcError = exception.getError()

    if( typeof rpcError === 'object' &&
      'status' in rpcError &&
      'message' in rpcError
    ) {
      const status = isNaN(+rpcError.status) ? 400 : +rpcError.status;
      return response.status(status).json(rpcError);
    }

    response.status(400).json({
      status: 400,
      message: rpcError
    })

  }

}