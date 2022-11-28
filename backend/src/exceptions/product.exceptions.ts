import { notFound } from '../utils/message-utils';

export class ProductNotFound extends Error {
  constructor(private readonly productId: string) {
    super(notFound(`Product ID (${productId})`));
  }
}

export class ProductAmountNotAvailable extends Error {
  constructor(private readonly productId: string, amount: number) {
    super(`Product ID (${productId}) amount (${amount}) is not available.`);
  }
}

export class DuplicateProduct extends Error {
  constructor(private readonly productId: string) {
    super(`Product ID (${productId}) is duplicated.`);
  }
}
