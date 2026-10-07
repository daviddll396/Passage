import { randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { db } from './db.js';
import { hashPassword } from './auth.js';

const prompt = createInterface({ input: stdin, output: stdout });

try {
  const name = (await prompt.question('Staff name: ')).trim();
  const email = (await prompt.question('Staff email: ')).trim().toLowerCase();
  if (!name || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw new Error('Enter a valid name and email address.');
  }

  const temporaryPassword = randomBytes(24).toString('base64url');
  const passwordHash = await hashPassword(temporaryPassword);
  await db.execute(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, \'staff\')',
    [name, email, passwordHash],
  );
  console.log(`Staff account created for ${email}. Save this initial password: ${temporaryPassword}`);
} catch (error) {
  console.error(error instanceof Error && error.message === 'Enter a valid name and email address.'
    ? error.message
    : 'Could not create the staff account. Check that the database is ready and the email is unused.');
  process.exitCode = 1;
} finally {
  prompt.close();
  await db.end();
}
