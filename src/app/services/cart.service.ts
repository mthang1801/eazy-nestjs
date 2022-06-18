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
import {
  productLeftJoiner,
  promoAccessoriesJoiner,
} from '../../utils/joinTable';
import { PromotionAccessoryService } from './promotionAccessory.service';
import { PromotionAccessoryRepository } from '../repositories/promotionAccessory.repository';
import { PromotionAccessoryEntity } from '../entities/promotionAccessory.entity';
import { PromotionAccessoryDetailRepository } from '../repositories/promotionAccessoryDetail.repository';
import { PromotionAccessoryDetailEntity } from '../entities/promotionAccessoryDetail.entity';
import { LessThan, MoreThan, IsNull } from '../../database/operators/operators';
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
    private promotionAccessoryRepo: PromotionAccessoryRepository<PromotionAccessoryEntity>,
    private promotionAccessoryDetailRepo: PromotionAccessoryDetailRepository<PromotionAccessoryDetailEntity>,
    private promoAccessoryService: PromotionAccessoryService,
  ) {}

  // async create(user_id: number, product_ids: number[]) {
  //   await this.cache.removeCartByUserId(user_id);
  //   let cart = await this.cartRepo.findOne({ user_id });
  //   if (!cart) {
  //     const cartData = { ...new CartEntity(), user_id };
  //     cart = await this.cartRepo.create(cartData);
  //   }
  //   if (!product_ids.length) {
  //     return;
  //   }

  //   for (let product_id of product_ids) {
  //     let checkProduct = await this.productRepo.findOne({
  //       product_id,
  //       product_function: Not(Equal(1)),
  //     });
  //     if (!checkProduct) {
  //       throw new HttpException('Không thể thêm SP cha vào giỏ hàng.', 400);
  //     }

  //     let cartItem = await this.cartItemRepo.findOne({
  //       cart_id: cart.cart_id,
  //       product_id,
  //     });
  //     if (!cartItem) {
  //       await this.cartItemRepo.create({
  //         cart_id: cart.cart_id,
  //         product_id,
  //         amount: 1,
  //       });
  //     }
  //     if (cartItem && cartItem.amount < 3) {
  //       await this.cartItemRepo.update(
  //         { cart_item_id: cartItem.cart_item_id },
  //         { amount: cartItem.amount + 1 },
  //       );
  //     }
  //   }

  //   let result = await this.get(user_id);
  //   await this.cache.setCartByUserId(user_id, result);
  //   return result;
  // }
  async create(user_id: number, data) {
    await this.cache.removeCartByUserId(user_id);
    let cart = await this.cartRepo.findOne({ user_id });
    if (!cart) {
      const cartData = { ...new CartEntity(), user_id };
      cart = await this.cartRepo.create(cartData);
    }

    let { product_id, promotion_ids, warranty_ids } = data;

    let product = await this.productRepo.findOne({
      product_id,
      product_function: Not(Equal(1)),
    });

    if (!product) {
      throw new HttpException('Không thể thêm SP cha vào giỏ hàng.', 400);
    }

    let cartItem = await this.cartItemRepo.findOne({
      cart_id: cart.cart_id,
      product_id,
    });

    let cartItemRes = cartItem ? { ...cartItem } : null;

    if (!cartItem) {
      cartItemRes = await this.cartItemRepo.create({
        cart_id: cart.cart_id,
        product_id,
        amount: 1,
      });
    }

    if (cartItem && cartItem.amount < 3) {
      if (cartItem.amount < 3) {
        cartItemRes = await this.cartItemRepo.update(
          { cart_item_id: cartItem.cart_item_id },
          { amount: cartItem.amount + 1 },
          true,
        );
      }
    }

    if (warranty_ids && warranty_ids.length) {
      for (let warrantyId of warranty_ids) {
        let checkExist = await this.cartItemRepo.findOne({
          cart_id: cart.cart_id,
          product_id: warrantyId,
        });

        if (!checkExist) {
          await this.cartItemRepo.create({
            cart_id: cart.cart_id,
            product_id: warrantyId,
            amount: 1,
            promotion_type: 3,
          });
        } else {
          await this.cartItemRepo.update(
            {
              cart_item_id: checkExist.cart_item_id,
            },
            { amount: Math.min(cartItemRes.amount, checkExist.amount + 1) },
          );
        }
      }
    }

    if (promotion_ids && promotion_ids.length) {
      for (let productId of promotion_ids) {
        const promotionProduct = await this.productRepo.findOne({
          product_id: productId,
        });
        if (!promotionProduct) {
          throw new HttpException('Không tìm thấy SP khuyến mãi', 404);
        }
        let promotionCartItem = await this.cartItemRepo.findOne({
          cart_id: cart.cart_id,
          product_id: productId,
          belong_order_detail_id: product.product_id,
        });
        if (!promotionCartItem) {
          await this.cartItemRepo.create(
            {
              cart_id: cart.cart_id,
              product_id: productId,
              amount: 1,
              belong_order_detail_id: product.product_id,
              belong_order_detail_appcore_id: product.product_appcore_id,
            },
            false,
          );
        } else {
          await this.cartItemRepo.update(
            { cart_item_id: promotionCartItem.cart_item_id },
            {
              amount: Math.min(
                promotionCartItem.amount + 1,
                cartItemRes.amount,
              ),
            },
          );
        }
      }
    }

    let result = await this.get(user_id);
    await this.cache.setCartByUserId(user_id, result);
    return result;
  }

  async get(user_id) {
    await this.cache.removeCartByUserId(user_id);
    let cartCacheResult = await this.cache.getCartByUserId(user_id);
    if (cartCacheResult) {
      return cartCacheResult;
    }
    const cart = await this.cartRepo.findOne({ user_id });
    if (!cart) {
      return {
        cart_id: null,
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

    let _promotionsProducts = cartItems
      .filter(
        (cartItem) =>
          cartItem.belong_order_detail_id && !cartItem.is_gift_taken,
      )
      .map(async (cartItem) => {
        const belongProduct = await this.productRepo.findOne({
          product_id: cartItem.belong_order_detail_id,
        });
        if (!belongProduct || !belongProduct.promotion_accessory_id) {
          return null;
        }

        const promotionAccessoryProduct =
          await this.promotionAccessoryDetailRepo.findOne({
            accessory_id: belongProduct.promotion_accessory_id,
            product_id: cartItem.product_id,
          });

        if (!promotionAccessoryProduct) {
          return null;
        }

        return {
          ...cartItem,
          ...promotionAccessoryProduct,
          price: promotionAccessoryProduct['promotion_price'],
        };
      });

    let _productCartItems = cartItems
      .filter((cartItem) => !cartItem.belong_order_detail_id)
      .map(async (cartItem) => {
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

        let filterConditions = (conditions) => [
          {
            ...conditions,
            [`${Table.PROMOTION_ACCESSORY}.display_at`]: LessThan(
              formatStandardTimeStamp(new Date()),
            ),
            [`${Table.PROMOTION_ACCESSORY}.end_at`]: MoreThan(
              formatStandardTimeStamp(new Date()),
            ),
            [`${Table.PROMOTION_ACCESSORY}.accessory_status`]: 'A',
          },
          {
            ...conditions,
            [`${Table.PROMOTION_ACCESSORY}.display_at`]: LessThan(
              formatStandardTimeStamp(new Date()),
            ),
            [`${Table.PROMOTION_ACCESSORY}.end_at`]: IsNull(),
            [`${Table.PROMOTION_ACCESSORY}.accessory_status`]: 'A',
          },
          {
            ...conditions,
            [`${Table.PROMOTION_ACCESSORY}.display_at`]: IsNull(),
            [`${Table.PROMOTION_ACCESSORY}.end_at`]: IsNull(),
            [`${Table.PROMOTION_ACCESSORY}.accessory_status`]: 'A',
          },
          {
            ...conditions,
            [`${Table.PROMOTION_ACCESSORY}.display_at`]: IsNull(),
            [`${Table.PROMOTION_ACCESSORY}.end_at`]: MoreThan(
              formatStandardTimeStamp(),
            ),
            [`${Table.PROMOTION_ACCESSORY}.accessory_status`]: 'A',
          },
        ];

        if (cartItem.free_accessory_id) {
          let giftAccessories = await this.promotionAccessoryDetailRepo.find({
            select: `*, ${Table.PRODUCT_PROMOTION_ACCESSOR_DETAIL}.*`,
            join: promoAccessoriesJoiner,
            where: filterConditions({
              [`${Table.PRODUCT_PROMOTION_ACCESSOR_DETAIL}.accessory_id`]:
                cartItem?.free_accessory_id,
            }),
          });

          if (giftAccessories.length) {
            let _giftAccessoriesPromise = giftAccessories.map(
              async (giftAccessory) => {
                let giftAccessoryData = {
                  ...giftAccessory,
                  amount: cartItem.amount,
                  price: giftAccessory.sale_price,
                  discount: giftAccessory.sale_price,
                  belong_order_detail_id: cartItem.product_id,
                  belong_order_detail_appcore_id: cartItem.product_appcore_id,
                  is_gift_taken: 1,
                };

                const checkGiftCartItemExist = await this.cartItemRepo.findOne({
                  product_id: giftAccessoryData.product_id,
                  cart_id: cartItem.cart_id,
                });

                if (!checkGiftCartItemExist) {
                  await this.cartItemRepo.create({
                    cart_id: cartItem.cart_id,
                    product_id: giftAccessoryData.product_id,
                    amount: cartItem.amount,
                    belong_order_detail_appcore_id: cartItem.product_appcore_id,
                    belong_order_detail_id: cartItem.product_id,
                    is_gift_taken: 1,
                  });
                } else {
                  if (checkGiftCartItemExist.amount != cartItem.amount) {
                    await this.cartItemRepo.update(
                      { cart_item_id: checkGiftCartItemExist.cart_item_id },
                      { amount: cartItem.amount },
                    );
                  }
                }

                return giftAccessoryData;
              },
            );

            cartItem['giftAccessories'] = await Promise.all(
              _giftAccessoriesPromise,
            );
          }
        }

        return cartItem;
      });

    const promotionsProducts = await Promise.all(_promotionsProducts);
    const productCartItems = await Promise.all(_productCartItems);

    const orderItems = [...productCartItems, ...promotionsProducts];

    let totalPrice = orderItems.reduce(
      (acc, item) => acc + item.price * item.amount,
      0,
    );

    const res: any = {
      cart_id: cart.cart_id,
      totalAmount: orderItems.length,
      totalPrice,
      cart_items: orderItems,
    };

    await this.cache.setCartByUserId(user_id, res);
    return res;
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
