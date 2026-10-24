import { execFileSync } from "node:child_process";
import { describe, it } from "vitest";

describe("Instagram giveaway", () => {
  it("passes the shared browser document, filter and HTTP boundary tests", () => {
    execFileSync(process.execPath, ["scripts/test-giveaway.mjs"], {
      cwd: process.cwd(),
      stdio: "pipe",
      timeout: 20_000,
    });
  });
});
