import { required, shouldBeNumber } from '../utils/message-utils';

export class ArgumentRequired extends Error {
  constructor(argName: string) {
    super(required('Argument ' + argName));
  }
}

export class ValueRequired extends Error {
  constructor(name: string) {
    super(required(name + ' value'));
  }
}

export class InvalidNumber extends Error {
  constructor(name: string, value: string) {
    super(`${shouldBeNumber(name)} Value: ${value}`);
  }
}

export class NotPositiveNumber extends Error {
  constructor(name: string, value: number) {
    super(`${name} should be a positive number. Value: ${value}`);
  }
}
