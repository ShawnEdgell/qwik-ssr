import { defineConfig, type UserConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import pkg from "./package.json";

type PkgDep = Record<string, string>;
const { dependencies = {}, devDependencies = {} } = pkg as any as {
  dependencies: PkgDep;
  devDependencies: PkgDep;
  [key: string]: unknown;
};

errorOnDuplicatesPkgDeps(devDependencies, dependencies);

export default defineConfig(({ command, mode }): UserConfig => {
  const isSSRBuild = mode === "ssr";

  return {
    plugins: [qwikCity(), qwikVite(), tsconfigPaths()],
    optimizeDeps: {
      exclude: [],
    },
    build: {
      ssr: isSSRBuild,
      outDir: isSSRBuild ? ".vercel/output/functions/api/_qwik-city.func" : "dist",
      rollupOptions: {
        output: {
          dir: isSSRBuild ? ".vercel/output/functions/api/_qwik-city.func" : "dist",
        }
      },
    },
    server: {
      headers: {
        "Cache-Control": "public, max-age=0",
      },
    },
    preview: {
      headers: {
        "Cache-Control": "public, max-age=600",
      },
    },
  };
});

function errorOnDuplicatesPkgDeps(
  devDependencies: PkgDep,
  dependencies: PkgDep,
) {
  const duplicateDeps = Object.keys(devDependencies).filter(
    (dep) => dependencies[dep]
  );

  const qwikPkg = Object.keys(dependencies).filter((value) =>
    /qwik/i.test(value)
  );

  if (qwikPkg.length > 0) {
    throw new Error(`Move qwik packages ${qwikPkg.join(", ")} to devDependencies`);
  }

  if (duplicateDeps.length > 0) {
    throw new Error(`The dependency "${duplicateDeps.join(", ")}" is listed in both "devDependencies" and "dependencies". Please move the duplicated dependencies to "devDependencies" only and remove it from "dependencies"`);
  }
}
