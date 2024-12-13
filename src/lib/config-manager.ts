import { ZodSchema } from "zod";
import { config } from "./config";
import { z } from "zod";

export interface ConfigItem {
  path: string;
  schema?: ZodSchema;
}

type ConfigManagerMap = Record<string, ConfigItem>;

interface ConfigManagerOptions {
  /**
   * If true, the config manager will exit the process if a validation error is encountered.
   * @default false
   */
  exitOnValidationError?: boolean;
}

export class ConfigManager<T extends ConfigManagerMap> {
  constructor(private readonly configMap: T, private readonly options: ConfigManagerOptions = {}) {
    this.validate();
  }

  private validate(): void {
    Object.entries(this.configMap).forEach(([key, { schema, path }]) => {
      if (!schema) {
        return;
      }

      try {
        const value = config.get(path);
        schema.parse(value);
      } catch (err) {
        console.error(`Config validation error for schema "${key}" at path "${path}"`, err);
        if (this.options.exitOnValidationError) {
          console.warn(`"exitOnValidationError" is set to true, exiting process...`);
          process.exit(1);
        }
      }
    });
  }

  get<K extends keyof T>(key: K): T[K]["schema"] extends ZodSchema<infer U> ? U : any {
    const cItem = this.configMap[key];

    if (!cItem || cItem.path === undefined) {
      throw new Error(
        `Config not found for "${key.toString()}", make sure you have defined it in the config map.`
      );
    }

    const { path, schema } = cItem;

    if (schema) {
      return config.get<z.infer<typeof schema>>(path, schema);
    }

    return config.get(path);
  }
}
