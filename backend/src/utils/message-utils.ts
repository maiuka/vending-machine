export function required(what: string) {
  return `${what} is required.`;
}

export function notFound(what: string) {
  return `${what} was not found.`;
}

export function forbidden(what: string) {
  return `The user is not allowed to ${what}.`;
}

export function shouldBeNumber(what: string) {
  return `${what} should be a number.`;
}
