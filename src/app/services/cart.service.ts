import { Injectable, HttpException } from '@nestjs/common';
import { CreateCartDto } from '../dto/cart/create-cart.dto';
import { CartEntity } from '../entities/cart.entity';
import { CartItemEntity } from '../entities/cartItem.entity';
import { CartRepository } from '../repositories/cart.repository';
import { CartItemRepository } from '../repositories/cartItem.repository';
import { formatStandardTimeStamp } from '../../utils/helper';
import { words } from 'lodash';
import { cartJoiner } from 'src/utils/joinTable';
import { Table } from 'src/database/enums';
import { ImagesLinksRepository } from '../repositories/imageLink.repository';
import { ImagesLinksEntity } from '../entities/imageLinkEntity';
import { ImagesRepository } from '../repositories/image.repository';
import { ImagesEntity } from '../entities/image.entity';
import { ImageObjectType } from '../../database/enums/tableFieldEnum/imageTypes.enum';
import { AlterUserCartDto } from '../dto/cart/update-cart.dto';
@Injectable()
export class CartService {
  constructor(
    private cartRepo: CartRepository<CartEntity>,
    private cartItemRepo: CartItemRepository<CartItemEntity>,
    private imageLinkRepo: ImagesLinksRepository<ImagesLinksEntity>,
    private imageRepo: ImagesRepository<ImagesEntity>,
  ) {}

  async create(user_id: number, product_id: number) {
    // Kiểm tra xem giỏ hàng đã tồn tại hay chưa
    let cart = await this.cartRepo.findOne({ user_id });
    if (!cart) {
      const cartData = { ...new CartEntity(), user_id };
      cart = await this.cartRepo.create(cartData);
    }
    const cartItem = await this.cartItemRepo.findOne({
      cart_id: cart.cart_id,
      product_id,
    });

    if (!cartItem) {
      await this.cartItemRepo.create({
        cart_id: cart.cart_id,
        product_id,
        amount: 1,
      });
    }

    if (cartItem && cartItem.amount < 3) {
      await this.cartItemRepo.update(
        { cart_item_id: cartItem.cart_item_id },
        { amount: cartItem.amount + 1 },
      );
    }
  }

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

    const totalAmount = cartItems.length;
    result['totalAmount'] = totalAmount;

    const totalPrice = cartItems.reduce(
      (acc, ele) => acc + ele.amount * ele.price,
      0,
    );
    result['totalPrice'] = totalPrice;

    for (let cartItem of cartItems) {
      cartItem['image'] = null;
      const productImageLink = await this.imageLinkRepo.findOne({
        object_id: cartItem.product_id,
        object_type: ImageObjectType.PRODUCT,
      });
      console.log(productImageLink);
      if (productImageLink) {
        const productImage = await this.imageRepo.findOne({
          image_id: productImageLink.image_id,
        });
        cartItem['image'] = { ...productImageLink, ...productImage };
      }
    }

    result['cart_items'] = cartItems;

    return result;
  }

  async alterUser(user_id: string, alter_user_id) {
    const currentCart = await this.cartRepo.findOne({ user_id });
    if (!currentCart) {
      throw new HttpException('Không tìm thấy giỏ hàng', 404);
    }

    await this.cartRepo.update(
      { cart_id: currentCart.cart_id },
      { user_id: alter_user_id },
    );
  }

  async update(cart_item_id, amount) {
    if (amount < 1) {
      throw new HttpException(
        'Số lượng sản phẩm đã giảm đến mức tối thiểu',
        400,
      );
    }
    if (amount > 3) {
      throw new HttpException('Số lượng sản phẩm đã vượt quá giới hạn', 400);
    }
    const cartItem = await this.cartItemRepo.findOne({ cart_item_id });
    if (!cartItem) {
      throw new HttpException('Không tìm thấy giỏ hàng.', 404);
    }

    await this.cartItemRepo.update({ cart_item_id }, { amount });
    return;
  }

  async delete(cart_item_id: number) {
    await this.cartItemRepo.delete({ cart_item_id });
  }

  async clearAll(cart_id) {
    await this.cartRepo.delete({ cart_id });
    await this.cartItemRepo.delete({ cart_id });
  }
}
