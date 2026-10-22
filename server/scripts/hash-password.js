import { createInterface } from 'node:readline/promises';
import bcrypt from 'bcryptjs';

async function readPassword() {
  if (process.argv[2]) return process.argv[2];
  const rl = createInterface({ input: process.stdin, output: process.stderr, terminal: true });
  const password = await rl.question('Password: ');
  rl.close();
  return password;
}

const password = await readPassword();
if (password.length < 12) {
  console.error('Use at least 12 characters.');
  process.exit(1);
}
console.log(await bcrypt.hash(password, 12));
