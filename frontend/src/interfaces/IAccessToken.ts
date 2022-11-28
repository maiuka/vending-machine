export default interface IAccessToken {
  exp?: number;
  iat?: number;
  role?: string;
  sub?: string;
  username?: string;
}
