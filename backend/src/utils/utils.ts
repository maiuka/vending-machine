import AppConfig from '../core/app-config';
import UserEntity from '../entities/user.entity';
import ICoinCount from '../interfaces/ICoinCount';
import * as bcrypt from 'bcrypt';

export function removeUserPassword(user: UserEntity) {
  if (!user) {
    return user;
  }
  const { password, ...others } = user;
  return others as UserEntity;
}

export async function numberToCoinsCounts(
  amount: number,
): Promise<ICoinCount[]> {
  const coins: ICoinCount[] = [];
  const supportedCoins = AppConfig.SUPPORTED_COINS;

  let num = amount;

  while (num > 0) {
    // Ensure num is an integer.
    if (num != Math.floor(num)) {
      throw new Error(`Number (${num}) should be an integer.`);
    }

    // Get max supported coin less than or equal to num.
    const filteredCoins = supportedCoins.filter((sc) => sc <= num);
    if (filteredCoins.length === 0) {
      throw new Error(
        `No supported coin is less than or equal to the number (${num}). The amount to convert is (${amount}).`,
      );
    }
    const maxCoin = filteredCoins.reduce(
      (prev, curr) => (curr > prev ? curr : prev),
      0,
    );

    const quotient = Math.floor(num / maxCoin);
    const remainder = num % maxCoin;

    coins.push({
      value: maxCoin,
      count: quotient,
    });

    num = remainder;
  }

  return coins;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
