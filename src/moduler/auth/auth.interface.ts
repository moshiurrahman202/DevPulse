export type TUser = {
    name: string,
    email: string,
    password: string,
    role?: "contributor" | "maintainer",
}

export type TLogin = {
    email: string,
    password: string
}