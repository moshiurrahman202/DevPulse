export const UserRole = {
  Contributor: "contributor",
  Maintainer: "maintainer",
} as const;

export type TUserRole = typeof UserRole[keyof typeof UserRole];

export type TUser = {
  name: string;
  email: string;
  password: string;
  role?: TUserRole;
};

export type TLogin = {
    email: string,
    password: string
}