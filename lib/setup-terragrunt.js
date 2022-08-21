// Node.js core
const os = require('os');
const path = require('path');

// External
const core = require('@actions/core');
const io = require('@actions/io');

async function installWrapper (pathToCLI) {
  let source, target;

  // If we're on Windows, then the executable ends with .exe
  const exeSuffix = os.platform().startsWith('win') ? '.exe' : '';

  // Rename terragrunt(.exe) to terragrunt-bin(.exe)
  try {
    source = [pathToCLI, `terragrunt${exeSuffix}`].join(path.sep);
    target = [pathToCLI, `terragrunt-bin${exeSuffix}`].join(path.sep);
    core.debug(`Moving ${source} to ${target}.`);
    await io.mv(source, target);
  } catch (e) {
    core.error(`Unable to move ${source} to ${target}.`);
    throw e;
  }

  // Install our wrapper as terraform
  try {
    source = path.resolve([__dirname, '..', 'wrapper', 'dist', 'index.js'].join(path.sep));
    target = [pathToCLI, 'terragrunt'].join(path.sep);
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
