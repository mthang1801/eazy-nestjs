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
import {
  cacheKeys,
  cacheTables,
  prefixCacheKey,
} from '../../utils/cache.utils';
import { RedisCacheService } from './redisCache.service';
import * as _ from 'lodash';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductsEntity } from '../entities/products.entity';

import { Equal, Not } from 'src/database/operators/operators';
import { ProductVariationGroupsRepository } from '../repositories/productVariationGroups.repository';
import { ProductVariationGroupsEntity } from '../entities/productVariationGroups.entity';
import { ProductVariationGroupProductsRepository } from '../repositories/productVariationGroupProducts.entity';
import { ProductVariationGroupProductsEntity } from '../entities/productVariationGroupProducts.entity';
import { productLeftJoiner } from '../../utils/joinTable';
import { PromotionAccessoryService } from './promotionAccessory.service';
@Injectable()
export class CartService {
  constructor(
    private cartRepo: CartRepository<CartEntity>,
    private cartItemRepo: CartItemRepository<CartItemEntity>,
    private imageLinkRepo: ImagesLinksRepository<ImagesLinksEntity>,
    private imageRepo: ImagesRepository<ImagesEntity>,
    private cache: RedisCacheService,
    private productRepo: ProductsRepository<ProductsEntity>,
    private productGroupRepo: ProductVariationGroupsRepository<ProductVariationGroupsEntity>,
    private productGroupProductRepo: ProductVariationGroupProductsRepository<ProductVariationGroupProductsEntity>,
    private promoAccessoryService: PromotionAccessoryService,
  ) {}

  async create(user_id: number, product_ids: number[]) {
    await this.cache.removeCartByUserId(user_id);
    let cart = await this.cartRepo.findOne({ user_id });
    if (!cart) {
      const cartData = { ...new CartEntity(), user_id };
      cart = await this.cartRepo.create(cartData);
    }
    if (!product_ids.length) {
      return;
    }

    for (let product_id of product_ids) {
      let checkProduct = await this.productRepo.findOne({
        product_id,
        product_function: Not(Equal(1)),
      });
      if (!checkProduct) {
        throw new HttpException('Không thể thêm SP cha vào giỏ hàng.', 400);
      }

      let cartItem = await this.cartItemRepo.findOne({
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

    let result = await this.get(user_id);
    await this.cache.setCartByUserId(user_id, result);
    await this.cache.removeCache(cacheTables.cart);
    return result;
  }

  async get(user_id) {
    let cartCacheResult = await this.cache.getCartByUserId(user_id);
    if (cartCacheResult) {
      return cartCacheResult;
    }
    const cart = await this.cartRepo.findOne({ user_id });
    if (!cart) {
      return {
        cart_id: 0,
        cart_items: [],
      };
    }

    let result = { ...cart };

    let cartItems = await this.cartRepo.find({
      select: `*, ${Table.CART_ITEMS}.product_id, ${Table.CATEGORIES}.slug as categoryId, ${Table.PRODUCTS}.slug as productSlug, ${Table.CART_ITEMS}.amount`,
      join: cartJoiner,
      where: { [`${Table.CART}.cart_id`]: result.cart_id },
    });

    cartItems = _.unionBy(cartItems, 'product_id');

    let totalPrice = 0;
    let giftAccessories = [];
    let promotionAccessories = [];
    let warrantyPackages = [];
    for (let cartItem of cartItems) {
      if (cartItem.product_type == 3) {
        let group = await this.productGroupRepo.findOne({
          product_root_id: cartItem.product_id,
        });
        if (group) {
          let productItems = await this.productGroupProductRepo.find({
            group_id: group.group_id,
          });
          let comboItems = productItems.filter(
            (productItem) => productItem.product_id != cartItem.product_id,
          );
          cartItem['comboItems'] = [];
          if (comboItems.length) {
            for (let { product_id } of comboItems) {
              let product = await this.productRepo.findOne({
                select: `*, ${Table.PRODUCTS}.product_id`,
                join: productLeftJoiner,
                where: { [`${Table.PRODUCTS}.product_id`]: product_id },
              });
              cartItem['comboItems'].push(product);
            }
          }
        }
      }

      let [_promotionAccessories, _giftAccessories, _warrantyPackages] =
        await this.promoAccessoryService.findAccessoriesGiftWarrantyInProduct([
          cartItem.product_id,
        ]);

      cartItem['giftAccessories'] = [];
      if (_giftAccessories.length) {
        giftAccessories = [..._giftAccessories, ...giftAccessories];
        cartItem['giftAccessories'] = giftAccessories.map((giftAccessory) => ({
          ...giftAccessory,
          amount: cartItem.amount,
          price: giftAccessory.sale_price,
        }));
      }

      if (_promotionAccessories) {
        promotionAccessories = [
          ...promotionAccessories,
          ..._promotionAccessories,
        ];
      }
      if (warrantyPackages) {
        warrantyPackages = [...warrantyPackages, ..._warrantyPackages];
      }
    }

    cartItems = cartItems.filter(
      (cartItem) =>
        !giftAccessories.some((item) => item.product_id == cartItem.product_id),
    );

    if (promotionAccessories.length) {
      cartItems = cartItems.map((cartItem) => {
        let checkPromotionExist = promotionAccessories.find(
          (item) => item.product_id == cartItem.product_id,
        );

        if (checkPromotionExist) {
          cartItem['price'] = +checkPromotionExist.promotion_price;
          cartItem['amount'] = cartItem.amount;
          cartItem['belong_order_detail_id'] = cartItem['product_id'];
          cartItem['is_gift_taken'] = '0';
        }
        return cartItem;
      });
    }

    if (warrantyPackages.length) {
      cartItems = cartItems.map((cartItem) => {
        let warrantyPackageExist = warrantyPackages.find(
          (item) => item.product_id == cartItem.product_id,
        );

        if (warrantyPackageExist) {
          cartItem['price'] = +warrantyPackageExist.sale_price;
          cartItem['amount'] = cartItem.amount;
        }
        return cartItem;
      });
    }

    const totalAmount = cartItems.length;
    result['totalAmount'] = totalAmount;

    totalPrice = cartItems.reduce(
      (acc, item) => acc + +item.price * +item.amount,
      0,
    );
    result['totalPrice'] = totalPrice;

    result['cart_items'] = cartItems;

    await this.cache.setCartByUserId(user_id, result);
    return result;
  }

  async alterUser(user_id: string, alter_user_id) {
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

    await this.cache.removeCartByUserId(user_id);
    await this.cache.removeCartByUserId(alter_user_id);
    let result = await this.get(alter_user_id);
    await this.cache.setCartByUserId(alter_user_id, result);
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

    await this.cache.removeCartByUserId(cart.user_id);
    let result = await this.get(cart.user_id);
    await this.cache.setCartByUserId(cart.user_id, result);

    return result;
  }

  async delete(cart_item_id: number) {
    await this.cache.removeCartByCartItemId(cart_item_id);
  }

  async clearAll(cart_id) {
    let cart = await this.cartRepo.delete({ cart_id }, true);

    await this.cartItemRepo.delete({ cart_id });

    if (cart?.user_id) {
      await this.cache.removeCartByUserId(cart.user_id);
    }
  }
}
