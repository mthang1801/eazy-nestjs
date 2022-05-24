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
import { cacheKeys, cacheTables, prefixCacheKey } from '../../constants/cache';
import { RedisCacheService } from './redisCache.service';
@Injectable()
export class CartService {
  constructor(
    private cartRepo: CartRepository<CartEntity>,
    private cartItemRepo: CartItemRepository<CartItemEntity>,
    private imageLinkRepo: ImagesLinksRepository<ImagesLinksEntity>,
    private imageRepo: ImagesRepository<ImagesEntity>,
    private cache: RedisCacheService,
  ) {}

  async create(user_id: number, product_id: number) {
    // Kiểm tra xem giỏ hàng đã tồn tại hay chưa
    let cartCacheKey = cacheKeys.cart(user_id);
    await this.cache.delete(cartCacheKey);

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

    let result = await this.get(user_id);
    if (result) {
      await this.cache.set(cartCacheKey, result);
      await this.cache.saveCache(
        cacheTables.cart,
        prefixCacheKey.cart,
        cartCacheKey,
      );
    }
  }

  async get(user_id) {
    let cartCacheKey = cacheKeys.cart(user_id);
    let cartCacheResult = await this.cache.get(cartCacheKey);
    // if (cartCacheResult) {
    //   return cartCacheResult;
    // }
    const cart = await this.cartRepo.findOne({ user_id });
    if (!cart) {
      throw new HttpException('Không tìm thấy giỏ hàng.', 404);
    }

    let result = { ...cart };

    const cartItems = await this.cartRepo.find({
      select: `*, ${Table.CATEGORIES}.slug as categoryId, ${Table.PRODUCTS}.slug as productSlug, ${Table.CART_ITEMS}.amount`,
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

    await this.cache.set(cartCacheKey, result);
    await this.cache.saveCache(
      cacheTables.cart,
      prefixCacheKey.cart,
      cartCacheKey,
    );

    return result;
  }

  async alterUser(user_id: string, alter_user_id) {
    let cartCacheKey = cacheKeys.cart(user_id);
    await this.cache.delete(cartCacheKey);
    const currentCart = await this.cartRepo.findOne({ user_id });
    if (!currentCart) {
      throw new HttpException('Không tìm thấy giỏ hàng', 404);
    }

    let currentCartItems = await this.cartItemRepo.find({
      cart_id: currentCart.cart_id,
    });

    const alterUserCart = await this.cartRepo.findOne({
      user_id: alter_user_id,
    });

    let alterUserCartItems = [];
    if (alterUserCart) {
      alterUserCartItems = await this.cartItemRepo.find({
        cart_id: alterUserCart.cart_id,
      });
    }

    await this.cartRepo.delete({ user_id: alter_user_id });
    const updatedCart = await this.cartRepo.update(
      { cart_id: currentCart.cart_id },
      { user_id: alter_user_id },
      true,
    );

    currentCartItems = [
      ...currentCartItems,
      ...alterUserCartItems.filter(
        ({ product_id }) =>
          !currentCartItems.some(
            ({ product_id: current_product_id }) =>
              product_id == current_product_id,
          ),
      ),
    ];

    if (alterUserCart) {
      await this.cartItemRepo.delete({ cart_id: alterUserCart.cart_id });
    }

    await this.cartItemRepo.delete({ cart_id: currentCart.cart_id });
    for (let cartItem of currentCartItems) {
      let cartItemData = {
        ...new CartItemEntity(),
        ...this.cartItemRepo.setData(cartItem),
        cart_id: updatedCart.cart_id,
      };
      await this.cartItemRepo.create(cartItemData);
    }

    cartCacheKey = cacheKeys.cart(alter_user_id);
    let result = await this.get(alter_user_id);
    await this.cache.set(cartCacheKey, result);
    await this.cache.saveCache(
      cacheTables.cart,
      prefixCacheKey.cart,
      cartCacheKey,
    );
    return result;
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

    let cart = await this.cartRepo.findOne({ cart_id: cartItem.cart_id });
    if (!cart) return;
    let cartCacheKey = cacheKeys.cart(cart.user_id);
    await this.cache.delete(cartCacheKey);
    let result = await this.get(cart.user_id);
    await this.cache.set(cartCacheKey, result);
    await this.cache.saveCache(
      cacheTables.cart,
      prefixCacheKey.cart,
      cartCacheKey,
    );
  }

  async delete(cart_item_id: number) {
    let cartItem = await this.cartItemRepo.delete({ cart_item_id }, true);
    if (cartItem) {
      let cart = await this.cartRepo.findOne({ cart_id: cartItem.cart_id });
      if (!cart) return;
      let cartCacheKey = cacheKeys.cart(cart.user_id);
      await this.cache.delete(cartCacheKey);
      let result = await this.get(cart.user_id);
      await this.cache.set(cartCacheKey, result);
      await this.cache.saveCache(
        cacheTables.cart,
        prefixCacheKey.cart,
        cartCacheKey,
      );
    }
  }

  async clearAll(cart_id) {
    let cart = await this.cartRepo.delete({ cart_id });
    await this.cartItemRepo.delete({ cart_id });
    if (!cart) return;
    let cartCacheKey = cacheKeys.cart(cart.user_id);
    await this.cache.delete(cartCacheKey);
  }
}
