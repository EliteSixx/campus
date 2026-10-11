import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (
      (specifier.startsWith("./") || specifier.startsWith("../")) &&
      context.parentURL
    ) {
      const parentDir = path.dirname(fileURLToPath(context.parentURL));
      const candidates = [
        path.resolve(parentDir, `${specifier}.ts`),
        path.resolve(parentDir, `${specifier}.tsx`),
        path.resolve(parentDir, specifier, "index.ts"),
      ];

      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          return nextResolve(pathToFileURL(candidate).href, context);
        }
      }
    }
    throw err;
  }
}
