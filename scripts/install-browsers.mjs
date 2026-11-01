import { spawn } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const environment = { ...process.env };
delete environment.PLAYWRIGHT_DOWNLOAD_HOST;

const child = spawn(npmCommand, ['playwright', 'install'], {
  env: environment,
  stdio: 'inherit',
});

child.on('error', (error) => {
  console.error(`Unable to install Playwright browsers: ${error.message}`);
  process.exitCode = 1;
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`Playwright browser installation stopped by signal ${signal}.`);
    process.exitCode = 1;
  } else {
    process.exitCode = code ?? 1;
  }
});
