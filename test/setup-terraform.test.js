// Mock external modules by default
jest.mock('@actions/core');
jest.mock('@actions/tool-cache');

const path = require('path');

const io = require('@actions/io');
const core = require('@actions/core');

const setup = require('../lib/setup-terragrunt');

// Overwrite defaults
// core.debug = jest
//   .fn(console.log);
// core.error = jest
//   .fn(console.error);

describe('Setup Terraform', () => {
  const HOME = process.env.HOME;
  const APPDATA = process.env.APPDATA;

  beforeEach(() => {
    process.env.HOME = '/tmp/asdf';
    process.env.APPDATA = '/tmp/asdf';
  });

  afterEach(async () => {
    await io.rmRF(process.env.HOME);
    process.env.HOME = HOME;
    process.env.APPDATA = APPDATA;
  });

  test('installs wrapper on linux', async () => {
    const wrapperPath = path.resolve([__dirname, '..', 'wrapper', 'dist', 'index.js'].join(path.sep));

    const ioMv = jest.spyOn(io, 'mv')
      .mockImplementation(() => {});
    const ioCp = jest.spyOn(io, 'cp')
      .mockImplementation(() => {});

    core.getInput = jest.fn().mockReturnValueOnce('file/terragrunt');

    await setup();

    expect(ioMv).toHaveBeenCalledWith(`file${path.sep}terragrunt`, `file${path.sep}terragrunt-bin`);
    expect(ioCp).toHaveBeenCalledWith(wrapperPath, `file${path.sep}terragrunt`);
  });
});
