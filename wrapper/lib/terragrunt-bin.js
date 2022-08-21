const os = require('os');
const path = require('path');

module.exports = (() => {
  // If we're on Windows, then the executable ends with .exe
  const exeSuffix = os.platform().startsWith('win') ? '.exe' : '';

  return [process.env.TERRAGRUNT_CLI_PATH, `terragrunt-bin${exeSuffix}`].join(path.sep);
})();
