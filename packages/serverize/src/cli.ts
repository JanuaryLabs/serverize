#!/usr/bin/env node
import setup from './setup';

import auth from './auth';
import deploy from './deploy';
import logs from './logs';
import { cli } from './program';
import project from './project';
import releases from './releases';
import secrets from './secrets';
import shazam from './shazam';
import tokens from './tokens';

cli
  .addCommand(deploy)
  .addCommand(secrets)
  .addCommand(logs)
  .addCommand(auth)
  .addCommand(project)
  .addCommand(tokens)
  .addCommand(releases)
  .addCommand(setup)
  .addCommand(shazam, { isDefault: true })
  .parse(process.argv);
