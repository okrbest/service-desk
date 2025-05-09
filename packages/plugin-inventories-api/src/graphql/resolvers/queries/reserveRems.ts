import {
  moduleCheckPermission
} from "@erxes/api-utils/src/permissions";
import { IContext } from "../../../connectionResolver";
import { escapeRegExp, paginate } from "@erxes/api-utils/src/core";
import { sendCoreMessage } from "../../../messageBroker";

interface IListArgs {
  page: number;
  perPage: number;
  sortField: string;
  sortDirection: number;
  _ids: string[];
  searchValue;
  departmentId: string;
  branchId: string;
  productId: string;
  productCategoryId: string;
  dateType: string;
  startDate: Date;
  endDate: Date;
}

const getGenerateFilter = async (subdomain: string, params: IListArgs) => {
  const {
    _ids,
    searchValue,
    branchId,
    departmentId,
    productId,
    productCategoryId
  } = params;

  const filter: any = {};

  if (branchId) {
    filter.branchId = branchId;
  }

  if (departmentId) {
    filter.departmentId = departmentId;
  }

  if (productId) {
    filter.productId = productId;
  } else {
    const productFilter: any = {};

    if (searchValue) {
      productFilter.query = {
        $or: [
          {
            name: { $regex: `.*${escapeRegExp(searchValue)}.*` }
          },
          {
            code: { $regex: `.*${escapeRegExp(searchValue)}.*` }
          },
          {
            barcodes: { $regex: `.*${escapeRegExp(searchValue)}.*` }
          }
        ]
      };
    }

    if (productCategoryId) {
      productFilter.categoryId = productCategoryId;
    }

    if (Object.keys(productFilter).length) {
      const products = await sendCoreMessage({
        subdomain,
        action: "products.find",
        data: { ...productFilter, fields: { _id: 1 } },
        isRPC: true,
        defaultValue: []
      });
      filter.productId = { $in: products.map(p => p._id) };
    }
  }

  return filter;
};

const reserveRemsQueries = {
  reserveRems: async (
    _root: any,
    params: IListArgs,
    { models, subdomain }: IContext
  ) => {
    const filter = await getGenerateFilter(subdomain, params);
    return paginate(models.ReserveRems.find(filter).sort({}).lean(), params);
  },

  reserveRemsCount: async (
    _root: any,
    params: IListArgs,
    { models, subdomain }: IContext
  ) => {
    const filter = await getGenerateFilter(subdomain, params);
    return await models.ReserveRems.find(filter).countDocuments();
  }
};

moduleCheckPermission(reserveRemsQueries, "manageRemainders");

export default reserveRemsQueries;
