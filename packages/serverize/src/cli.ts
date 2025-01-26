#!/usr/bin/env node
import { Command, program } from 'commander';
import auth, { signin, signout, signup, whoami } from './auth';
import deploy from './deploy';
import logs from './logs';
import project from './project';
import releases from './releases';
import secrets from './secrets';
import setup from './setup';
import shazam from './shazam';
import tokens from './tokens';

const cli = program
  .description('Serverize CLI for managing projects, releases, and more')
  .addCommand(deploy)
  .addCommand(secrets)
  .addCommand(logs)
  .addCommand(auth)
  .addCommand(whoami)
  .addCommand(signin)
  .addCommand(signup)
  .addCommand(signout)
  .addCommand(project)
  .addCommand(tokens)
  .addCommand(releases)
  .addCommand(setup)
  .addCommand(shazam, { isDefault: true })
  .addCommand(
    new Command('_internal').action(() => {
      // do nothing
    }),
    { hidden: true },
  )
  .parse(process.argv);

export default cli;
