/* eslint-disable no-unused-vars */

declare type Nullable<T> = T | null
declare type NonNullable<T> = T extends null | undefined ? never : T
declare type UnfAble<T> = T | undefined
declare type Obj = Record<string, any>
declare type ObjT<T> = Record<string, T>
declare type AnyFn = (...args: any[]) => any;
