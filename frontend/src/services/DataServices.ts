import AppConfig from "../core/app-config";
import IUser from "../interfaces/IUser";
import HttpServices from "./HttpServices";
import IProduct from "../interfaces/IProduct";
import IProductToBuy from "../interfaces/IProductToBuy";
import IRegisterUser from "../interfaces/IRegisterUser";
import IBuyProductsResponse from "../interfaces/IBuyProductsResponse";
import ICoinCount from "../interfaces/ICoinCount";

function loginUser(username: string, password: string) {
  return HttpServices.post(AppConfig.ENDPOINT_AUTH_LOGIN, {
    username,
    password,
  });
}

function registerUser(user: IRegisterUser) {
  return HttpServices.post(AppConfig.ENDPOINT_USER, user);
}

function getAllUsers(): Promise<IUser[]> {
  return HttpServices.get(AppConfig.ENDPOINT_USER);
}

function getUserCoins(): Promise<ICoinCount[]> {
  return HttpServices.get(AppConfig.ENDPOINT_COINS);
}

function getAllProducts(): Promise<IProduct[]> {
  return HttpServices.get(AppConfig.ENDPOINT_PRODUCT);
}

function addProduct(product: IProduct): Promise<IProduct> {
  const data = {
    cost: product.cost,
    productName: product.productName,
    amountAvailable: product.amountAvailable,
  };
  return HttpServices.post(AppConfig.ENDPOINT_PRODUCT, data);
}

function removeProduct(productId: string): Promise<IProduct> {
  return HttpServices.del(AppConfig.ENDPOINT_PRODUCT + "/" + productId);
}

function buyProducts(
  productsToBuy: IProductToBuy[]
): Promise<IBuyProductsResponse> {
  const products = productsToBuy.map((p) => ({
    productId: p.productId,
    productAmount: p.productQuantityToBuy,
  }));
  const data = { products };
  return HttpServices.post(AppConfig.ENDPOINT_BUY, data);
}

function depositCoin(cc: ICoinCount): Promise<IBuyProductsResponse> {
  return HttpServices.post(AppConfig.ENDPOINT_DEPOSIT, { value: cc.value });
}

function resetDeposit(): Promise<IBuyProductsResponse> {
  return HttpServices.post(AppConfig.ENDPOINT_RESET);
}

const DataServices = {
  loginUser,
  registerUser,
  getAllUsers,
  getUserCoins,
  getAllProducts,
  addProduct,
  removeProduct,
  buyProducts,
  depositCoin,
  resetDeposit,
};

export default DataServices;
