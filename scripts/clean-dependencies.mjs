import { rm } from "node:fs/promises";

await rm("node_modules", { recursive: true, force: true });
await rm("package-lock.json", { force: true });
