import z from 'zod';
import { parse } from '#core/validation.ts';
import { initialize } from '#extensions/postgresql/index.ts';

const env = z.object({
  ...(await import('#extensions/postgresql/index.ts')).env,
  ...(await import('#extensions/firebase-auth/index.ts')).env,
  CONNECTION_STRING: z.string().url(),
  NODE_ENV: z.enum(['development', 'production']),
});
const [data, errors] = parse(env, process.env);

if (errors) {
  console.error(
    'Environment Variable Validation Error:',
    JSON.stringify(errors, null, 2),
  );
  console.error(
    'Please check that all required environment variables are correctly set.',
  );
  process.exit(1);
}
process.env = Object.assign({}, process.env, data);

declare global {
  namespace NodeJS {
    // Extend the ProcessEnv interface with the parsed environment variables
    // @ts-ignore
    interface ProcessEnv extends z.infer<typeof env> {}
  }
}

// Block the event loop until the database is initialized
await initialize()
  .then(() => {
    console.log('Database initialized');
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
