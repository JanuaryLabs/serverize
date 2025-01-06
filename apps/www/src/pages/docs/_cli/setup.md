# CLI Documentation

Below is a comprehensive overview of all commands, options, arguments, and subcommands.

## `Serverize`

**Description:** Serverize

**Usage:** `[options] [command]`

**Options:**

- `-V, --version`: output the version number

**Subcommands:**

### `deploy`

  **Description:** No description provided.

  **Usage:** `npx serverize deploy -p <projectName>`

  **Options:**

  - `-f, --file [dockerfilepath]`: Name of the Dockerfile or Compose file (default:"$(pwd)/Dockerfile") (default: `Dockerfile`)
  - `-o, --output-file <outputFile>` (required): Write output to a file
  - `-c, --channel <channel>` (required): Channel name (dev or preview) (default: `dev`)
  - `--cwd [cwd]`: Project directory (default: `/Users/ezzabuzaid/Desktop/january/serverize`)
  - `-r, --release <release>` (required): Release name (default: `latest`)
  - `-p, --project-name <projectName>` (required): The project name

### `secrets`

  **Description:** Manage project secrets

  **Usage:** `[options] [command]`

  **Subcommands:**

#### `set`

    **Description:** No description provided.

    **Usage:** `[options] NAME=VALUE NAME=VALUE ...`

    **Arguments:**

    - `secrets (variadic)`: Secrets in format NAME=VALUE

    **Options:**

    - `-p, --project-name <projectName>` (required): The project name
    - `-c, --channel <channel>` (required): Channel name (dev or preview) (default: `dev`)

#### `set-file`

    **Description:** No description provided.

    **Usage:** `[options] .env`

    **Arguments:**

    - `envFile`: Path to the file with secrets

    **Options:**

    - `-p, --project-name <projectName>` (required): The project name
    - `-c, --channel <channel>` (required): Channel name (dev or preview) (default: `dev`)

### `logs`

  **Description:** No description provided.

  **Usage:** `[options]`

  **Options:**

  - `-p, --project-name <projectName>` (required): The project name
  - `-c, --channel <channel>` (required): Channel name (dev or preview) (default: `dev`)
  - `-r, --release <release>` (required): Release name (default: `latest`)

### `auth`

  **Description:** Authenticate with serverize (signin, signup, signout)

  **Usage:** `[options] [command]`

  **Subcommands:**

#### `signin` (aliases: login)

    **Description:** No description provided.

    **Usage:** `[options]`

#### `signup` (aliases: register)

    **Description:** No description provided.

    **Usage:** `[options]`

#### `signout` (aliases: logout)

    **Description:** No description provided.

    **Usage:** `[options]`

#### `whoami`

    **Description:** No description provided.

    **Usage:** `[options]`

### `whoami`

  **Description:** No description provided.

  **Usage:** `[options]`

### `projects` (aliases: project, p)

  **Description:** Manage your projects

  **Usage:** `[options] [command]`

  **Subcommands:**

#### `create`

    **Description:** No description provided.

    **Usage:** `[options] [name]`

    **Arguments:**

    - `name`: Name of the project

#### `list` (aliases: ls)

    **Description:** No description provided.

    **Usage:** `[options]`

### `tokens`

  **Description:** No description provided.

  **Usage:** `[options] [command]`

  **Subcommands:**

#### `create`

    **Description:** No description provided.

    **Usage:** `[options]`

    **Options:**

    - `-p, --project-name <projectName>` (required): The project name

#### `list` (aliases: ls)

    **Description:** No description provided.

    **Usage:** `[options]`

#### `revoke`

    **Description:** No description provided.

    **Usage:** `[options] <token>`

    **Arguments:**

    - `token`: Token to revoke

### `releases`

  **Description:** No description provided.

  **Usage:** `[options] [command]`

  **Subcommands:**

#### `list` (aliases: ls)

    **Description:** No description provided.

    **Usage:** `[options]`

    **Options:**

    - `-p, --project-name <projectName>` (required): The project name
    - `-c, --channel <channel>` (required): Channel name (dev or preview) (default: `dev`)

#### `terminate`

    **Description:** No description provided.

    **Usage:** `[options]`

    **Options:**

    - `-c, --channel <channel>` (required): Channel name (dev or preview) (default: `dev`)
    - `-r, --release <release>` (required): Release name (default: `latest`)
    - `-p, --project-name <projectName>` (required): The project name

#### `restart`

    **Description:** No description provided.

    **Usage:** `[options]`

    **Options:**

    - `-p, --project-name <projectName>` (required): The project name
    - `-c, --channel <channel>` (required): Channel name (dev or preview) (default: `dev`)
    - `-r, --release <release>` (required): Release name (default: `latest`)

### `setup`

  **Description:** No description provided.

  **Usage:** `[options] [command]`

  **Subcommands:**

#### `list` (aliases: ls)

    **Description:** No description provided.

    **Usage:** `[options]`

#### `init`

    **Description:** No description provided.

    **Usage:** `[options] [framework]`

    **Arguments:**

    - `framework`: Framework to setup

    **Options:**

    - `-f, --force`: Force setup
    - `--cwd [cwd]`: Project directory (default: `/Users/ezzabuzaid/Desktop/january/serverize`)

### `shazam`

  **Description:** No description provided.

  **Usage:** `[options]`

  **Options:**

  - `-o, --output [file]`: Write output to a file
  - `--cwd [cwd]`: Project directory (default: `/Users/ezzabuzaid/Desktop/january/serverize`)
  - `-c, --channel <channel>` (required): Channel name (dev or preview) (default: `dev`)
  - `-r, --release <release>` (required): Release name (default: `latest`)
  - `-p, --project-name <projectName>` (required): The project name
  - `--framework [framework]`: Framework to setup
  - `--save`: Save the setup
  - `--use-dockerfile-if-exists [useDockerfile]`: No description
  - `-f, --file [dockerfilepath]`: Name of the Dockerfile or Compose file (default:"$(pwd)/Dockerfile")
