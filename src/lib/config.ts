import raw from "config";
import { ZodType } from "zod";

class ConfigWrapper {
  private rawConfig: typeof raw;
  constructor() {
    this.rawConfig = raw;
  }

  get<T = any>(property?: string, schema?: ZodType<T>): T {
    const value = property ? this.rawConfig.get(property) : this.rawConfig;

    if (schema) {
      try {
        return schema.parse(value) as T;
      } catch (error) {
        throw new Error(`Config validation error for "${property ? property : "root"}": ${error}`);
      }
    }

    return value as T;
  }
}

const config = new ConfigWrapper();

export { config, raw };
