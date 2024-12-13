/**
 * In order the node-config to work properly in the test environment, we need to set the NODE_CONFIG_DIR to the config directory.
 * https://github.com/node-config/node-config/wiki/Environment-Variables#node_config_dir
 */
process.env.NODE_CONFIG_DIR = __dirname + "/config/";

import { z } from "zod";
import { ConfigManager, raw } from "../index";
import { describe, expect, it, jest } from "@jest/globals";

const cmm = {
  raw: {
    path: "",
  },
  key: {
    path: "some_key",
    schema: z.string(),
  },
  object: {
    path: "object",
    schema: z.object({
      key: z.string(),
      number: z.number(),
    }),
  },
  nested_key: {
    path: "object.key",
    schema: z.string(),
  }
} as const;

const configManager = new ConfigManager<typeof cmm>(cmm);

describe("config manager", () => {
  it("should return the expected values", () => {
    expect(configManager.get("raw")).toEqual(raw);
    expect(configManager.get("key")).toEqual("some_value");
    expect(configManager.get("nested_key")).toEqual("value");
    expect(configManager.get("object")).toEqual({ key: "value", number: 123 });
  });

  it("should throw an error if the schema is unknown", () => {
    expect(() => configManager.get("unknown" as any)).toThrowError();
  });

  it("should exit the process if the schema is incorrect and exitOnValidationError is true", () => {
    const processExitSpy = jest.spyOn(process, "exit").mockImplementation(undefined as any);

    const customCmm = {
      ...cmm,
      key: {
        path: "some_key",
        // A wrong schema to check if the process will exit
        schema: z.number(),
      },
    } as const;

    new ConfigManager<typeof customCmm>(customCmm, {
      exitOnValidationError: true,
    });

    expect(processExitSpy).toHaveBeenCalledWith(1);
    processExitSpy.mockRestore();
  });
});
