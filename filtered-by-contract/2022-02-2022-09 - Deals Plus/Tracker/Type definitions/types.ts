export type TOptional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type TPickEnum<T, K extends T> = {
  [P in keyof K]: P extends K ? P : never;
};