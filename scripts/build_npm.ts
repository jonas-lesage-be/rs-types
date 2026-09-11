import { build, emptyDir } from "@deno/dnt";
import { logger } from "@/logger/logger.ts";

await emptyDir("./npm");

const version = Deno.args[0];
if (!version) {
  logger.error("Version argument is required. Usage: deno run -A scripts/build_npm.ts <version>");
  Deno.exit(1);
}

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    deno: true,
  },
  test: false,
  packageManager: "pnpm",
  compilerOptions: {
    lib: ["ESNext", "DOM"],
  },
  package: {
    name: "rs-types",
    version,
    description: "A library that provides Rust types in TypeScript.",
    license: "MIT",
    scripts: {
      test: "vitest run esm/",
    },
    devDependencies: {
      vitest: "^5.0.0",
    },
    type: "module",
  },
  postBuild() {
    Deno.copyFileSync("README.md", "npm/README.md");
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
  },
});
