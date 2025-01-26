import { confirm, input, password } from '@inquirer/prompts';
import { Command } from 'commander';
import { signOut } from 'firebase/auth';
import validator from 'validator';

import { client, serverizeManagementUrl } from './lib/api-client';
import {
  initialise,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from './lib/auth-methods';
import { auth } from './lib/firebase';
import { askForProjectName, showError, spinner, tell } from './program';

import { box } from '@january/console';

const CLIENT_ID =
  process.env.NODE_ENV === 'development'
    ? 'Ov23liFrVjYBjqttXVYt'
    : 'Ov23liTdbDl03bHIuT4N';
const REDIRECT_URI = `${serverizeManagementUrl}/callback`;

async function github() {
  const timestamp = Date.now();
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    cache_bust: timestamp.toString(),
    redirect_uri: encodeURI(`${REDIRECT_URI}/github`),
  });
  const authUrl = `https://github.com/login/oauth/authorize?${params}`;
  // await open(authUrl);
}
async function google() {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=1073944994711-7&redirect_uri=${REDIRECT_URI}/google&response_type=code`;
  // await open(authUrl);
}

async function selectProvider() {
  // return select({
  //   message: 'Provider',
  //   default: 'github',
  //   loop: true,
  //   choices: [
  //     {
  //       disabled: true,
  //       name: 'Github',
  //       value: 'github',
  //     },
  //     {
  //       disabled: true,
  //       name: 'Google',
  //       value: 'google',
  //     },
  //     {
  //       name: 'Email & Password',
  //       value: 'password',
  //     },
  //   ] as const,
  // });
  return 'password' as string;
}

async function credsForm(validatePassword = true) {
  const email = await input({
    message: 'Email',
    validate: validator.isEmail,
  });
  const pw = await password({
    message: 'Password',
    validate: (value) => {
      if (!validatePassword) {
        return validator.isStrongPassword(value, {
          minLength: 8,
          minLowercase: 0,
          minNumbers: 0,
          minUppercase: 0,
          minSymbols: 0,
        });
      }
      const strongEnough = validator.isStrongPassword(value, {
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
        minUppercase: 1,
        minSymbols: 1,
      });
      if (!strongEnough) {
        return 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol.';
      }
      return true;
    },
  });
  return { email, pw };
}

async function askUser() {
  const user = await initialise();
  if (user) {
    const yes = await confirm({
      message: 'You are already signed in. Do you want to sign out first?',
      default: false,
    });
    if (yes) {
      await signOut(auth);
      return true;
    }
    return false;
  }
  return true;
}

export async function login() {
  const value = await selectProvider();
  switch (value) {
    case 'github':
      await github();
      break;
    case 'google':
      await signInWithGoogle();
      break;
    case 'password':
      {
        try {
          const { email, pw } = await credsForm(false);
          tell('Signing in...');

          const { token } = await signInWithEmail(email, pw);
          client.setOptions({ token });
        } catch (error) {
          showError(error as Error);
          process.exit(1);
        }
      }
      break;
  }
}

export async function register() {
  const value = await selectProvider();

  switch (value) {
    case 'github':
      await github();
      return undefined;
    case 'google':
      await signInWithGoogle();
      return undefined;
    case 'password': {
      const { email, pw } = await credsForm();
      try {
        tell('Creating account...', true);
        const { user } = await signUpWithEmail(email, pw);
        const orgName = await input({
          message: 'Organization name',
          validate: (v) => {
            const isValid = validator.isAlpha(v, 'en-US', { ignore: '-' });
            if (!isValid) {
              return 'Organization name can only contain letters and hyphens';
            }
            return true;
          },
        });
        const projectName = await askForProjectName();
        tell('Continuing...');
        const [, orgError] = await client.request(
          'POST /organizations/default',
          {
            uid: user.uid,
            name: orgName,
            projectName,
          },
        );
        if (orgError) {
          showError(orgError);
          await user.delete();
          process.exit(1);
        }

        // refresh get the custom claims
        const token = await user.getIdToken(true);
        client.setOptions({ token });
        await user.reload();

        return projectName;
      } catch (error) {
        await auth.currentUser?.delete().catch(() => {
          // noop
          // TODO: report to admin
        });
        spinner.fail((error as Error).message);
        process.exit(1);
      }
    }
    default:
      return undefined;
  }
}

export const signin = new Command('signin')
  .alias('login')
  .summary('Sign in to your Serverize account')
  .action(async () => {
    const wants = await askUser();
    if (!wants) {
      return;
    }
    await login();
    spinner.succeed('Signed in');
  });

export const signup = new Command('signup')
  .alias('register')
  .summary('Sign up for a new Serverize account')
  .action(async () => {
    const wants = await askUser();
    if (!wants) {
      return;
    }
    const projectName = await register();
    if (projectName) {
      spinner.succeed(`You're ready to deploy ${projectName}`);
      console.log(
        box(
          `Deploy ${projectName}`,
          `To deploy: npx serverize deploy -p ${projectName}`,
          `To set secrets: npx serverize secrets set-file .env -p ${projectName}`,
        ),
      );
    }
  });

export const signout = new Command('signout')
  .alias('logout')
  .summary('Sign out of your Serverize account')
  .action(async () => {
    const user = await initialise();
    if (!user) {
      tell('Not authenticated');
      return;
    }
    const yes = await confirm({
      message: 'Are you sure you want to sign out?',
      default: false,
    });
    if (yes) {
      await signOut(auth);
      tell('Signed out');
    }
  });

export const whoami = new Command('whoami')
  .summary('Show the currently authenticated user')
  .action(async () => {
    const user = await initialise();
    if (user) {
      console.log(
        `Signed in as ${user.displayName || user.email || user.phoneNumber}`,
      );
    } else {
      console.log('Not authenticated');
    }
  });

export default new Command('auth')
  .description(
    `Access Serverize by signing up for a new account using the auth signup command or logging in with the auth signin command if you already have an account. To disconnect, use the auth logout command.`,
  )
  .summary('Sign in, sign up, or sign out of your Serverize account')
  .addCommand(signin)
  .addCommand(signup)
  .addCommand(signout)
  .addCommand(whoami);
