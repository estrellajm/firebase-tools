import * as clc from "colorette";
import * as _ from "lodash";

import { logger } from "../../../logger";
import { promptOnce } from "../../../prompt";
import { requirePermissions } from "../../../requirePermissions";
import { previews } from "../../../previews";
import { Options } from "../../../options";
import { ensure } from "../../../ensureApiEnabled";

/**
 * Set up a new firebase project for functions.
 */
export async function doSetup(setup: any, config: any, options: Options) {
  logger.info();
  logger.info(
    "A " + clc.bold("functions") + " directory will be created in your project with sample code"
  );
  logger.info(
    "pre-configured. Functions can be deployed with " + clc.bold("firebase deploy") + "."
  );
  logger.info();

  setup.functions = {};
  const projectId = setup?.rcfile?.projects?.default;
  if (projectId) {
    await requirePermissions({ ...options, project: projectId });
    await Promise.all([
      ensure(projectId, "cloudfunctions.googleapis.com", "unused", true),
      ensure(projectId, "runtimeconfig.googleapis.com", "unused", true),
    ]);
  }
  const choices = [
    {
      name: "JavaScript",
      value: "javascript",
    },
    {
      name: "TypeScript",
      value: "typescript",
    },
  ];
  if (previews.golang) {
    choices.push({
      name: "Go",
      value: "golang",
    });
  }
  const language = await promptOnce({
    type: "list",
    message: "What language would you like to use to write Cloud Functions?",
    default: "javascript",
    choices,
  });
  _.set(setup, "config.functions.ignore", [
    "node_modules",
    ".git",
    "firebase-debug.log",
    "firebase-debug.*.log",
  ]);
  return require("./" + language).setup(setup, config);
}
