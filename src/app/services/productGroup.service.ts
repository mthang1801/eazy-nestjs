import { Injectable } from '@nestjs/common';
import { ProductsEntity } from '../entities/products.entity';
import { ProductVariationGroupFeaturesEntity } from '../entities/productVariationGroupFeatures.entity';
import { ProductVariationGroupProductsEntity } from '../entities/productVariationGroupProducts.entity';
import { ProductVariationGroupsEntity } from '../entities/productVariationGroups.entity';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductVariationGroupFeaturesRepository } from '../repositories/productVariationGroupFeatures.repository';
import { ProductVariationGroupProductsRepository } from '../repositories/productVariationGroupProducts.entity';
import { ProductVariationGroupsRepository } from '../repositories/productVariationGroups.repository';
import { JoinTable } from '../../database/enums/joinTable.enum';
import { Table } from '../../database/enums/tables.enum';
import { ProductFeatureValueRepository } from '../repositories/productFeaturesValues.repository';
import { ProductFeatureValueEntity } from '../entities/productFeaturesValues.entity';
import { IsNull, Not } from 'src/database/find-options/operators';
import { convertToMySQLDateTime, generateRandomString } from 'src/utils/helper';
@Injectable()
export class ProductGroupService {
  constructor(
    private groupRepo: ProductVariationGroupsRepository<ProductVariationGroupsEntity>,
    private groupProductRepo: ProductVariationGroupProductsRepository<ProductVariationGroupProductsEntity>,
    private groupFeatureRepo: ProductVariationGroupFeaturesRepository<ProductVariationGroupFeaturesEntity>,
    private productRepo: ProductsRepository<ProductsEntity>,
    private productFeatureValueRepo: ProductFeatureValueRepository<ProductFeatureValueEntity>,
  ) {}

  async autoGenerate() {
    //===========Product group, product group product =============

    // Lấy danh sách các sản phẩm cha (bao gồm SP cấu hình, ngoài trự sản phẩm service product_code =4)
    let parentProductsList = await this.productRepo.find({
      select: ['*'],
      join: {
        [JoinTable.leftJoin]: {
          [Table.PRODUCT_DESCRIPTION]: {
            fieldJoin: 'product_id',
            rootJoin: 'product_id',
          },
        },
      },
      where: { [`${Table.PRODUCTS}.parent_product_id`]: IsNull() },
    });

    //Không tính SP dịch vụ
    parentProductsList = parentProductsList.filter(
      ({ product_type }) => product_type != 4,
    );

    // Kiểm tra xem các parent này đã tạo group hay chưa, nếu đã tạo rồi thì bỏ qua, nếu chưa thì sẽ tạo mới
    for (let parentProductItem of parentProductsList) {
      const productGroup = await this.groupRepo.findOne({
        product_root_id: parentProductItem.product_id,
      });

      if (!productGroup) {
        const newProductGroup = await this.groupRepo.create({
          code: generateRandomString(),
          product_root_id: parentProductItem.product_id,
          group_type: parentProductItem.product_type === 3 ? 2 : 1,
          created_at: convertToMySQLDateTime(),
          updated_at: convertToMySQLDateTime(),
        });
        await this.groupProductRepo.createSync({
          product_id: parentProductItem.product_id,
          parent_product_id: parentProductItem.parent_product_id,
          group_id: newProductGroup.group_id,
          product_group_name: parentProductItem.shortname,
        });
      }
    }

    // Tìm ds các SP con, sau đó tim group chứa SP cha, kiểm tra SP con đã chứa trong đó hay chưa, nếu chưa thì thêm vào
    const childrenProductsList = await this.productRepo.find({
      select: ['*'],
      where: { [`${Table.PRODUCTS}.parent_product_id`]: Not(IsNull()) },
    });
    for (let childProduct of childrenProductsList) {
      // Kiểm tra nhóm của parent product đã tồn tại hay chưa, nếu tồn tại rồi thì đưa vào trong, nếu chưa thì bỏ qua
      const parentProductGroup = await this.groupRepo.findOne({
        product_root_id: childProduct.parent_product_id,
      });
      if (parentProductGroup) {
        // Kiểm tra SP con đã nằm trong group product của SP cha hay chưa, nếu chưa thì thêm, nếu có bỏ qua
        const childProductGroupProduct = await this.groupProductRepo.findOne({
          group_id: parentProductGroup.group_id,
          product_id: childProduct.product_id,
        });
        if (!childProductGroupProduct) {
          await this.groupProductRepo.createSync({
            group_id: parentProductGroup.group_id,
            parent_product_id: childProduct.parent_product_id,
            product_id: childProduct.product_id,
          });
        }
      }
    }

    //============ Product group features =============
    // Đồng bộ thuộc tính SP
    // Lấy Danh sách các group -> group products -> lấy danh sách các SP trong group -> Lấy danh sách các feature trong product feature values
    let groupLists = await this.groupRepo.find({
      select: ['group_id'],
    });

    for (let { group_id } of groupLists) {
      const productMembersList = await this.groupProductRepo.find({
        select: ['product_id'],
        where: { group_id },
      });
      for (let { product_id } of productMembersList) {
        // Kiểm tra features theo product_id trong product_feature_values
        const featuresList = await this.productFeatureValueRepo.find({
          select: ['feature_id', 'variant_id'],
          where: { product_id },
        });

        // Đưa vào product group features
        if (featuresList.length) {
          // Kiểm tra xem trong product_group_features với group_id đã tồn tại feature_id này hay chưa

          for (let { feature_id, variant_id } of featuresList) {
            if (!feature_id || !variant_id) {
              continue;
            }
            let featureValueInGroup = await this.groupFeatureRepo.findOne({
              feature_id,
              variant_id,
              group_id,
            });
            // Nếu trong group features không tìm thấy thì sẽ thêm feature này vào group, ngược lại bỏ qua
            if (!featureValueInGroup) {
              await this.groupFeatureRepo.createSync({
                feature_id,
                variant_id,
                group_id,
              });
            }
          }
        }
      }
    }
  }
}
