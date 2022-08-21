const core = require('@actions/core');

const setup = require('./lib/setup-terragrunt');

(async () => {
  try {
    await setup();
  } catch (error) {
    core.setFailed(error.message);
  }
})();
