export type pickEnum<T, K extends T> = {
  [P in keyof K]: P extends K ? P : never;
};

export type TPickRename<T, K extends keyof T, R extends PropertyKey> = Omit<T, K> & { [P in R]?: T[K] };

export type TRemoveDefaultProps<T> = Omit<T, "className" | "dataAttributes">;