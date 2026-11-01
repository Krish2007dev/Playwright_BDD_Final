import { execFile } from "node:child_process";
import process from "node:process";

const reports = process.argv.slice(2);
if (reports.length === 0) {
  throw new Error("Provide at least one report path.");
}

for (const report of reports) {
  const command =
    process.platform === "win32"
      ? "cmd"
      : process.platform === "darwin"
        ? "open"
        : "xdg-open";
  const args =
    process.platform === "win32" ? ["/c", "start", "", report] : [report];
  execFile(command, args, (error) => {
    if (error) {
      console.error(`Unable to open report ${report}: ${error.message}`);
    }
  });
}
