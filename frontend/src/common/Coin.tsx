export interface CoinProps {
  value: number;
  count: number;
  index: number;
  disabled?: boolean;
  onClick?: () => void;
}

const Coin = (props: CoinProps) => {
  const cw = "coin-wrapper";
  return (
    <div
      className={`${cw} ${cw}-i${props.index} ${cw}-v${props.value} ${cw}-${
        props.disabled ? "disabled" : "enabled"
      }`}
    >
      <span
        className="coin"
        onClick={() => !props.disabled && props.onClick && props.onClick()}
      >
        {props.value}
      </span>
      <br />
      <span className="coin-count">{props.count}</span>
    </div>
  );
};

export default Coin;
