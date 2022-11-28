import { notFound } from '../utils/message-utils';

export class UserNotFound extends Error {
  constructor(userId: string) {
    super(notFound(`User ID (${userId})`));
  }
}

export class UsernameExists extends Error {
  constructor(username: string) {
    super(`Username (${username}) is in use by another user.`);
  }
}

export class UserDepositInsufficient extends Error {
  constructor(currentDeposit: number, amountToWithdraw: number) {
    super(
      `User current deposit (${currentDeposit}) is less than the amount (${amountToWithdraw}) to withdraw.`,
    );
  }
}
