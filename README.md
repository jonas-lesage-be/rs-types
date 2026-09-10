# rs-types

A library that provides Rust types in TypeScript. This library contains TypeScript implementations of the following Rust types: `Result`, `Option`, `HashMap`, and `HashSet`.

## Installation

```bash
# deno
deno add npm:rs-types
# npm
npm install --save-dev rs-types
```

## Usage

### Result

```ts
import { Result } from "rs-types";

const success = Result.Ok(42);
const failure = Result.Err("something went wrong");

if (success.isOk()) console.log(success.unwrap());

const fromPromise = Result.from(Promise.resolve(100));
```

### Option

```ts
import { Option } from "rs-types";

const some = Option.Some(10);
const none = Option.None;

if (some.isSome()) console.log(some.unwrap());

const fromNullable = Option.from(null);
```

### HashMap

```ts
import { HashMap } from "rs-types";

const map = HashMap.from({ key: "value" });
const entry = map.get("key");

if (entry) console.log(entry.value);
```

### HashSet

```ts
import { HashSet } from "rs-types";

const set = HashSet.from([1, 2, 3]);
const exists = set.contains(2);

if (exists) console.log("Found 2");
```

## Project layout

```text
src/
├── hashmap/       # Rust-like HashMap.
├── hashset/       # Rust-like HashSet.
├── option/        # Option type (Some/None).
├── result/        # Result type (Ok/Err).
└── mod.ts         # Main entry point.
```

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/name`).
3. Ensure all code passes `deno task lint`.
4. Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
