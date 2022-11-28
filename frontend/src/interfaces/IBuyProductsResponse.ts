import ICoinCount from "./ICoinCount";
import IProduct from "./IProduct";

export default interface IBuyProductsResponse {
  totalSpent: number;
  change: ICoinCount[];
  purchasedProducts: IProduct[];
}
