import { useContext, useEffect, useRef, useState } from "react";
import { Badge, Button, Table } from "react-bootstrap";
import AppConfig from "../core/app-config";
import AppPage from "../common/AppPage";
import Coins from "../common/Coins";
import GlobalContext from "../context/GlobalStateContext";
import ICoinCount from "../interfaces/ICoinCount";
import IProductToBuy from "../interfaces/IProductToBuy";
import DataServices from "../services/DataServices";
import IBuyProductsResponse from "../interfaces/IBuyProductsResponse";

const BuyPage = () => {
  const isMounted = useRef(false);
  const [isInteractingWithCoins, setIsInteractingWithCoins] = useState(false);
  const [coinsCounts, setCoinsCounts] = useState([] as ICoinCount[]);
  const [productsToBuy, setProductsToBuy] = useState([] as IProductToBuy[]);
  const { showSuccess, showException } = useContext(GlobalContext);

  const resetCoinsCounts = () => {
    setCoinsCounts(
      AppConfig.SUPPORTED_COINS.map(
        (c) => ({ value: c, count: 0 } as ICoinCount)
      )
    );
  };

  const applyCoins = (coins: ICoinCount[]) => {
    setCoinsCounts(
      AppConfig.SUPPORTED_COINS.map((sc) => {
        const coin = coins.find((c) => c.value === sc);
        return { value: sc, count: coin ? coin.count : 0 } as ICoinCount;
      })
    );
  };

  const getAllProducts = () => {
    DataServices.getAllProducts().then((allProducts) => {
      setProductsToBuy(
        allProducts.map(
          (p) =>
            ({
              productId: p.id,
              productName: p.productName,
              productCost: p.cost,
              productQuantityAvailable: p.amountAvailable,
              productQuantityToBuy: 0,
            } as IProductToBuy)
        )
      );
    });
  };

  const applyUserCoins = () => {
    DataServices.getUserCoins().then((coins) => {
      applyCoins(coins);
    });
  };

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      applyUserCoins();
      getAllProducts();
    }
  }, []);

  const onProductToBuyCountChange = (productId: string, amount: number) => {
    const index = productsToBuy.findIndex((p) => p.productId === productId);
    setProductsToBuy([
      ...productsToBuy.slice(0, index),
      { ...productsToBuy[index], productQuantityToBuy: amount },
      ...productsToBuy.slice(index + 1),
    ]);
  };

  const buyProducts = () => {
    DataServices.buyProducts(
      productsToBuy.filter((p) => p.productQuantityToBuy > 0)
    )
      .then((response: IBuyProductsResponse) => {
        getAllProducts();
        applyCoins(response.change);
        showSuccess && showSuccess("Products successfully purchased.", true);
      })
      .catch((e) => {
        showException && showException(e);
      });
  };

  const resetDeposit = () => {
    setIsInteractingWithCoins(true);

    DataServices.resetDeposit()
      .then(() => {
        resetCoinsCounts();
        showSuccess && showSuccess("Deposit successfully reseted.", true);
      })
      .catch((e) => {
        showException && showException(e);
      })
      .finally(() => setIsInteractingWithCoins(false));
  };

  const onCoinsClick = (coinValue: number) => {
    const index = coinsCounts.findIndex((cc) => cc.value === coinValue);
    const coinCount = coinsCounts[index];
    coinCount.count = coinCount.count + 1;

    setIsInteractingWithCoins(true);

    DataServices.depositCoin(coinCount)
      .then(() => {
        setCoinsCounts((prevSate) => [
          ...prevSate.slice(0, index),
          { ...coinCount },
          ...prevSate.slice(index + 1),
        ]);
        showSuccess &&
          showSuccess(`${coinCount.value} coin successfully deposited.`, true);
      })
      .catch((e) => {
        showException && showException(e);
      })
      .finally(() => setIsInteractingWithCoins(false));
  };

  const totalDeposit = coinsCounts
    .map((cc) => cc.count * cc.value)
    .reduce((prev, curr) => prev + curr, 0);

  const canBuyProducts =
    productsToBuy.filter((p) => p.productQuantityToBuy > 0).length > 0 &&
    productsToBuy.filter((p) => p.productQuantityToBuy < 0).length === 0;

  const canResetDeposit = coinsCounts.filter((cc) => cc.count > 0).length > 0;

  return (
    <AppPage header="Buy Products">
      <p>
        <b>Select coins to deposit...</b>
      </p>
      <Coins
        coinsCounts={coinsCounts}
        disabled={isInteractingWithCoins}
        onClick={(v) => onCoinsClick(v)}
      />
      <Badge bg="secondary" className="my-3" style={{ fontSize: "15px" }}>
        Total Deposit: {totalDeposit} $
      </Badge>
      <p>
        <b>Select products to buy...</b>
      </p>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th className="text-end">Cost</th>
            <th className="text-end">Quantity Available</th>
            <th className="text-end">Quantity to Buy</th>
          </tr>
        </thead>
        <tbody>
          {productsToBuy.map((product) => (
            <tr key={product.productId}>
              <td>{product.productId}</td>
              <td>{product.productName}</td>
              <td className="text-end">{product.productCost} $</td>
              <td className="text-end">{product.productQuantityAvailable}</td>
              <td
                className={`text-end ${
                  product.productQuantityToBuy < 0 ||
                  product.productQuantityToBuy >
                    product.productQuantityAvailable
                    ? "bg-danger"
                    : ""
                }`}
              >
                <input
                  type="number"
                  value={product.productQuantityToBuy}
                  className={`text-end ${
                    product.productQuantityToBuy < 0 ||
                    product.productQuantityToBuy >
                      product.productQuantityAvailable
                      ? "bg-danger"
                      : ""
                  }`}
                  style={{ width: "100%" }}
                  onChange={(event) =>
                    onProductToBuyCountChange(
                      product.productId,
                      +event.target.value
                    )
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Button
        variant="primary"
        onClick={() => buyProducts()}
        disabled={!canBuyProducts}
      >
        Buy Products
      </Button>
      <Button
        className="ms-3"
        variant="secondary"
        onClick={() => resetDeposit()}
        disabled={!canResetDeposit}
      >
        Reset Deposit
      </Button>
    </AppPage>
  );
};

export default BuyPage;
