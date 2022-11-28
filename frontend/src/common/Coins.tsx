import Coin from "./Coin";
import ICoinCount from "../interfaces/ICoinCount";

export interface CoinsProps {
  disabled?: boolean;
  coinsCounts: ICoinCount[];
  onClick?: (coinValue: number) => void;
}

const Coins = (props: CoinsProps) => {
  return (
    <div>
      {(props.coinsCounts ?? []).map((cc, i) => (
        <Coin
          key={i}
          index={i}
          value={cc.value}
          count={cc.count}
          disabled={props.disabled}
          onClick={() => props.onClick && props.onClick(cc.value)}
        />
      ))}
    </div>
  );
};

export default Coins;
