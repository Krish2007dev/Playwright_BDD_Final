import { access, copyFile } from "node:fs/promises";
import path from "node:path";

const environment = process.argv[2] || "dev";
if (!/^[a-z0-9-]+$/i.test(environment)) {
  throw new Error(
    "Environment name may contain only letters, numbers, and hyphens.",
  );
}

const target = path.resolve(`.env.${environment}`);
try {
  await access(target);
  console.log(`${path.basename(target)} already exists; leaving it unchanged.`);
} catch {
  await copyFile(".env.example", target);
  console.log(
    `Created ${path.basename(target)}. Update its values before running tests.`,
  );
}
