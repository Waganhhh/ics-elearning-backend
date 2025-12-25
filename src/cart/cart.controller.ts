import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  addToCart(@Body() addToCartDto: AddToCartDto, @GetUser() user: User) {
    return this.cartService.addToCart(addToCartDto, user);
  }

  @Get()
  getCart(@GetUser() user: User) {
    return this.cartService.getCart(user);
  }

  @Get('count')
  getCartCount(@GetUser() user: User) {
    return this.cartService.getCartCount(user);
  }

  @Get('total')
  getCartTotal(@GetUser() user: User) {
    return this.cartService.getCartTotal(user);
  }

  @Delete('clear')
  clearCart(@GetUser() user: User) {
    return this.cartService.clearCart(user);
  }

  @Delete(':id')
  removeFromCart(@Param('id') id: string, @GetUser() user: User) {
    return this.cartService.removeFromCart(id, user);
  }
}
