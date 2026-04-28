import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const args = process.argv.slice(2);
const mode = args[0] ?? "dev";
const nextArgs = [mode, ...args.slice(1)];
const port = readOptionValue(nextArgs, "--port") ?? process.env.PORT ?? "3000";
const host = readOptionValue(nextArgs, "--hostname") ?? process.env.HOSTNAME ?? "localhost";
const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

process.stdout.write(`cxnext frontend listening on http://${host}:${port}\n`);

const child = spawn(process.execPath, [nextBin, ...nextArgs], {
  stdio: "inherit",
  windowsHide: true,
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    if (!child.killed) {
      child.kill(signal);
    }
  });
}

child.once("exit", (code) => {
  process.exit(Number(code ?? 0));
});

function readOptionValue(values, name) {
  const equalsArg = values.find((value) => value.startsWith(`${name}=`));
  if (equalsArg) {
    return equalsArg.slice(name.length + 1);
  }

  const index = values.indexOf(name);
  if (index === -1) {
    return undefined;
  }

  return values[index + 1];
}
