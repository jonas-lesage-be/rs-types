import * as ResultNamespace from "./result.ts";

/**
 * Re-export the clean interface type for Result
 */
export type Result<T, E> = ResultNamespace.Result<T, E>;

/**
 * Static companion methods for Result.
 * Merges seamlessly with the `Result` type declaration.
 */
export const Result = {
  Ok: ResultNamespace.Ok,
  Err: ResultNamespace.Err,
  from: ResultNamespace.from,
  fromThrowable: ResultNamespace.fromThrowable,
  fromPromise: ResultNamespace.fromPromise,
  all: ResultNamespace.all,
  any: ResultNamespace.any,
} as const;
