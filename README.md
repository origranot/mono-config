# mono-config

The `mono-config` package provides a simple way to share and manage configuration across your monorepo.
We wrap the commonly used [config](https://www.npmjs.com/package/config) package to provide additional functionality, specifically for monorepos.

## Installation

```bash
npm install mono-config
```

## Usage

### Config

First, import the `config` object from `mono-config`:

```typescript
import { config } from "mono-config";
```

There are two main ways to use this `config` object to access your configuration values:

#### Without validation

You can get the configuration value by providing the path for your configurations:

```typescript
const value = config.get("settings.db.host");
```

#### With validation

The `config` object allows you to ensure configuration values are meet certain criteria using [Zod](https://zod.dev/) schemas.

First, define your schema:

```typescript
import { z } from "zod";

const firstAppSchema = z.object({
  name: z.string(),
  db: z.object({
    host: z.string(),
    port: z.number(),
    user: z.string(),
    password: z.string(),
  }),
});
```

Now, you can get and validate your configuration values:

```typescript
const firstAppConfig = config.get("first_app", firstAppSchema);
```

If the value of the `first_app` configuration does not meet the schema, an error with a detailed explanation will be thrown.

### ConfigManager

This class will help ou manage your configurations accross microservices in your monorepo.
Import the `ConfigManager` class from `mono-config`:

```typescript
import { ConfigManager } from "mono-config";
```

Let's assume your monorepo configuration looks like this:

```json
{
  "first_app": {
    "name": "First App",
    "port": 3000,
    "db": {
      "host": "localhost",
      "port": 5432,
      "user": "user",
      "password": "password"
    }
  },
  "second_app": {
    "name": "Second App",
    "port": 3001
  }
}
```

Create the corresponding `Zod` schema for each configuration (property / microservice) you want to validate and manage:

```typescript
const firstAppSchema = z.object({
  name: z.string(),
  port: z.number(),
  db: z.object({
    host: z.string(),
    port: z.number(),
    user: z.string(),
    password: z.string(),
  }),
});

const secondAppSchema = z.object({
  name: z.string(),
  port: z.number(),
});
```

Then, create a `ConfigManagerMap` to associate each schema with it's configuration path:

```typescript
const cmm = {
  firstApp: {
    path: "first_app", // The key in the config JSON
    schema: firstAppSchema, // The schema to validate the configuration (optional)
  },
  secondApp: {
    path: "second_app",
    schema: secondAppSchema,
  },
} as const; // This is important to ensure the type safety
```

Next, create a new instance of `ConfigManager`:

```typescript
const configManager = new ConfigManager(cmm);
```

Tada :tada:, you can now access your configurations using the `configManager` object!

```typescript
const firstAppName = configManager.get("firstApp").name; // Strongly typed!
```

#### ConfigManager Optional Options

This is the list of optional options you can pass to the `ConfigManager` constructor:

| Option                  | Description                                                                         | Default |
| ----------------------- | ----------------------------------------------------------------------------------- | ------- |
| `exitOnValidationError` | If set to `true`, the process will exit if a configuration does not meet the schema | `false` |

### Raw Configuration

You can still access the raw configuration object by importing the `raw` object from `mono-config`:

```typescript
import { raw } from "mono-config";
```
