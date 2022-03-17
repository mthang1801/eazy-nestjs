import { Injectable, HttpException } from '@nestjs/common';
import { CreateCartDto } from '../dto/cart/create-cart.dto';
import { CartEntity } from '../entities/cart.entity';
import { CartItemEntity } from '../entities/cartItem.entity';
import { CartRepository } from '../repositories/cart.repository';
import { CartItemRepository } from '../repositories/cartItem.repository';
import { UpdateCartDto } from '../dto/cart/update-cart.dto';
import { convertToMySQLDateTime } from '../../utils/helper';
import { words } from 'lodash';
import { cartJoiner } from 'src/utils/joinTable';
import { Table } from 'src/database/enums';
@Injectable()
export class CartService {
  constructor(
    private cartRepo: CartRepository<CartEntity>,
    private cartItemRepo: CartItemRepository<CartItemEntity>,
  ) {}

  async get(user_id) {
    const cart = await this.cartRepo.findOne({ user_id });
    if (!cart) {
      throw new HttpException('Không tìm thấy giỏ hàng.', 404);
    }

    let result = { ...cart };

    const cartItems = await this.cartRepo.find({
      select: `*, ${Table.CATEGORIES}.slug as categorySlug, ${Table.PRODUCTS}.slug as productSlug, ${Table.CART_ITEMS}.amount`,
      join: cartJoiner,
      where: { [`${Table.CART}.cart_id`]: result.cart_id },
    });

    result['cart_items'] = cartItems;

    const totalAmount = cartItems.reduce((acc, ele) => acc + ele.amount, 0);
    result['totalAmount'] = totalAmount;

    return result;
  }

  async create(data: CreateCartDto) {
    const cartData = { ...new CartEntity(), ...this.cartRepo.setData(data) };
    const newCart = await this.cartRepo.create(cartData);

    for (let cartItem of data.cart_items) {
      const cartItemData = {
        ...new CartItemEntity(),
        ...this.cartItemRepo.setData(cartItem),
        cart_id: newCart.cart_id,
      };
      await this.cartItemRepo.createSync(cartItemData);
    }
  }

  async update(user_id: string, data: UpdateCartDto) {
    const cart = await this.cartRepo.findOne({ user_id });
    if (!cart) {
      throw new HttpException('Không tìm thấy giỏ hàng.', 404);
    }
    let result = { ...cart };
    const cartData = this.cartRepo.setData(data);
    if (Object.entries(cartData).length) {
      const updatedCart = await this.cartRepo.update(
        { user_id },
        { ...cartData, updated_at: convertToMySQLDateTime() },
      );
      result = { ...result, ...updatedCart };
    }

    const currentCartItems = await this.cartItemRepo.find({
      where: { cart_id: result.cart_id },
    });

    let willRemoveCartItems = currentCartItems.filter(
      (cartItem) =>
        !data.cart_items.some(
          ({ cart_item_id }) => cart_item_id === cartItem.cart_item_id,
        ),
    );

    let willAddCartItems = data.cart_items.filter(
      (cartItem) => !cartItem.cart_item_id,
    );

    let willUpdateCartItems = currentCartItems.filter((cartItem) =>
      data.cart_items.some(
        ({ cart_item_id }) => cart_item_id === cartItem.cart_item_id,
      ),
    );

    if (willRemoveCartItems.length) {
      for (let cartItem of willRemoveCartItems) {
        await this.cartItemRepo.delete({ cart_item_id: cartItem.cart_item_id });
      }
    }

    if (willAddCartItems) {
      for (let cartItem of willAddCartItems) {
        const cartItemData = {
          ...new CartItemEntity(),
          ...this.cartItemRepo.setData(cartItem),
          cart_id: result.cart_id,
        };
        await this.cartItemRepo.createSync(cartItemData);
      }
    }

    if (willUpdateCartItems.length) {
      for (let cartItem of willUpdateCartItems) {
        const cartItemData = this.cartItemRepo.setData(cartItem);
        await this.cartItemRepo.update(
          { cart_item_id: cartItem.cart_item_id },
          cartItemData,
        );
      }
    }
  }

  async delete(user_id: string) {
    const cart = await this.cartRepo.findOne({ user_id });
    if (cart) {
      await this.cartRepo.delete({ cart_id: cart.cart_id });
      await this.cartItemRepo.delete({ cart_id: cart.cart_id });
    }
  }
}
