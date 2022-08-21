// Node.js core
const path = require('path');

// External
const core = require('@actions/core');
const io = require('@actions/io');

async function installWrapper (pathToCLI) {
  let source, target;

  // Rename terragrunt to terragrunt-bin
  try {
    source = pathToCLI;
    target = pathToCLI + '-bin';
    core.debug(`Moving ${source} to ${target}.`);
    await io.mv(source, target);
  } catch (e) {
    core.error(`Unable to move ${source} to ${target}.`);
    throw e;
  }

  // Install our wrapper as terraform
  try {
    source = path.resolve([__dirname, '..', 'wrapper', 'dist', 'index.js'].join(path.sep));
    target = [pathToCLI].join(path.sep);
    core.debug(`Copying ${source} to ${target}.`);
    await io.cp(source, target);
  } catch (e) {
    core.error(`Unable to copy ${source} to ${target}.`);
    throw e;
  }

  // Export a new environment variable, so our wrapper can locate the binary
  core.exportVariable('TERRAGRUNT_CLI_PATH', pathToCLI);
}

async function run () {
  try {
    // Gather GitHub Actions inputs
    const pathToCLI = core.getInput('terragrunt_path');

    await installWrapper(pathToCLI);

    // Add to path
    core.addPath(pathToCLI);
  } catch (error) {
    core.error(error);
    throw error;
  }
}

module.exports = run;
