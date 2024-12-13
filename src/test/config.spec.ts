/**
 * In order the node-config to work properly in the test environment, we need to set the NODE_CONFIG_DIR to the config directory.
 * https://github.com/node-config/node-config/wiki/Environment-Variables#node_config_dir
 */
process.env.NODE_CONFIG_DIR = __dirname + "/config/";

import { config, raw } from "../index";
import { z } from "zod";
import { describe, expect, it } from "@jest/globals";

describe("config", () => {
  it("should be defined", () => {
    expect(config).toBeDefined();
    expect(raw).toBeDefined();
  });

  describe("with schema", () => {
    const objectSchema = z.object({
      key: z.string(),
      number: z.number(),
    });

    it("should validate the config for certain path", () => {
      const value = config.get("object", objectSchema);
      expect(value).toEqual({ key: "value", number: 123 });
    });

    it("should validate the all config", () => {
      const schema = z.object({
        some_key: z.string(),
        big_number: z.number(),
        object: objectSchema,
        string_array: z.array(z.string()),
      });

      const value = config.get(undefined, schema);
      expect(value).toEqual(raw);
    });

    it("should validate nested properties", () => {
      const value = config.get("object.key", z.string());
      expect(value).toEqual("value");
    });

    it("should throw an error if property is undefined", () => {
      expect(() => config.get("non_existing", z.any())).toThrowError();
    });

    it("should throw an error if the schema is incorrect", () => {
      expect(() => config.get("some_key", z.number())).toThrowError();
    });
  });

  describe("without schema", () => {
    it("should get the config", () => {
      const value = config.get();
      const valueWithEmptyPath = config.get("");

      expect(value).toEqual(raw);
      expect(valueWithEmptyPath).toEqual(raw);
    });

    it("should throw an error for unknown property", () => {
      expect(() => config.get("non_existing")).toThrowError();
    });
  });
});
