import { initialize } from '@extensions/postgresql';
import { parse } from '@workspace/validation';
import z from 'zod';

const env = z.object({
  ...(await import('@extensions/postgresql')).env,
  ...(await import('@extensions/firebase-auth')).env,
  CONNECTION_STRING: z.string().url(),
  NODE_ENV: z.enum(['development', 'production']),
});
const [data, errors] = parse(env, process.env);
console.log(errors);
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
