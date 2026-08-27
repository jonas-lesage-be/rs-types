import * as OptionNamespace from "./option.ts";

/**
 * Re-export the clean interface type for Option
 */
export type Option<T> = OptionNamespace.Option<T>;

/**
 * Static companion methods for Option.
 * Merges seamlessly with the `Option` type declaration.
 */
export const Option = {
  Some: OptionNamespace.Some,
  None: OptionNamespace.None,
  from: OptionNamespace.from,
  fromNullable: OptionNamespace.fromNullable,
  all: OptionNamespace.all,
  any: OptionNamespace.any,
} as const;
