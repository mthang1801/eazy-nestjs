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
import { ImagesLinksRepository } from '../repositories/imageLink.repository';
import { ImagesLinksEntity } from '../entities/imageLinkEntity';
import { ImagesRepository } from '../repositories/image.repository';
import { ImagesEntity } from '../entities/image.entity';
import { ImageObjectType } from '../../database/enums/tableFieldEnum/imageTypes.enum';
@Injectable()
export class CartService {
  constructor(
    private cartRepo: CartRepository<CartEntity>,
    private cartItemRepo: CartItemRepository<CartItemEntity>,
    private imageLinkRepo: ImagesLinksRepository<ImagesLinksEntity>,
    private imageRepo: ImagesRepository<ImagesEntity>,
  ) {}

  async create(user_id: number, data: CreateCartDto) {
    // Kiểm tra xem giỏ hàng đã tồn tại hay chưa
    const cart = await this.cartRepo.findOne({ user_id });

    //TH 1 : Gio hang đã tồn tại
    if (cart) {
      //TH giỏ hàng tồn tại, kiểm tra xem sản phẩm trong giỏ hàng đã tồn tại hay chưa
      const cartItem = await this.cartItemRepo.findOne({
        cart_id: cart.cart_id,
        product_id: data.product_id,
      });
      // Nếu SP đã tồn tại -> update amount
      if (cartItem) {
        await this.cartItemRepo.update(
          { cart_item_id: cartItem.cart_item_id },
          { amount: data.amount },
        );
      } else {
        const newCartItemData = {
          ...new CartItemEntity(),
          ...this.cartItemRepo.setData(data),
          cart_id: cart.cart_id,
        };
        await this.cartItemRepo.create(newCartItemData);
      }
    } else {
      // TH giỏ hàng chưa tồn tại :
      // 1. Tạo mới giỏ hàng
      // 2. Thêm item vào giỏ hàng
      const newCartData = { ...new CartEntity(), user_id };
      const newCart = await this.cartRepo.create(newCartData);

      const newCartItemData = {
        ...new CartItemEntity(),
        ...this.cartItemRepo.setData(data),
        cart_id: newCart.cart_id,
      };
      await this.cartItemRepo.create(newCartItemData);
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

    const totalAmount = cartItems.reduce((acc, ele) => acc + ele.amount, 0);
    result['totalAmount'] = totalAmount;

    const totalPrice = cartItems.reduce(
      (acc, ele) =>
        acc + (ele.amount * ele.price * (100 - ele.percentage_discount)) / 100,
      0,
    );
    result['totalPrice'] = totalPrice;

    for (let cartItem of cartItems) {
      cartItem['image'] = null;
      const productImageLink = await this.imageLinkRepo.findOne({
        object_id: cartItem.product_id,
        object_type: ImageObjectType.PRODUCT,
      });
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

  async update(user_id: string, data: UpdateCartDto) {
    const currentCart = await this.cartRepo.findOne({ user_id });
    if (!currentCart) {
      throw new HttpException('Không tìm thấy giỏ hàng', 404);
    }

    await this.cartRepo.update(
      { cart_id: currentCart.cart_id },
      { user_id: data.alter_user_id },
    );
  }

  async delete(user_id: number, cart_item_id: number) {
    const cart = await this.cartRepo.findOne({ user_id });
    if (!cart) {
      throw new HttpException('Không tìm thấy giỏ hàng', 404);
    }

    const cartItem = await this.cartItemRepo.findOne({
      cart_id: cart.cart_id,
      cart_item_id,
    });
    if (!cartItem) {
      throw new HttpException(
        'Xoá không thành công, người dùng hoặc id giỏ hàng không đúng',
        404,
      );
    }

    await this.cartItemRepo.delete({ cart_item_id });
  }

  async clearAll(user_id) {
    const cart = await this.cartRepo.findOne({ user_id });
    if (!cart) {
      throw new HttpException('Không tìm thấy giỏ hàng.', 404);
    }
    await this.cartRepo.delete({ cart_id: cart.cart_id });
    await this.cartItemRepo.delete({ cart_id: cart.cart_id });
  }
}
