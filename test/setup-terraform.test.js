// Mock external modules by default
jest.mock('@actions/core');
jest.mock('@actions/tool-cache');
// Mock Node.js core modules
jest.mock('os');

const os = require('os');
const path = require('path');

const io = require('@actions/io');
const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const nock = require('nock');

const json = require('./index.json');
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
    const version = '0.1.1';
    const credentialsHostname = 'app.terraform.io';
    const credentialsToken = 'asdfjkl';
    const wrapperPath = path.resolve([__dirname, '..', 'wrapper', 'dist', 'index.js'].join(path.sep));

    const ioMv = jest.spyOn(io, 'mv')
      .mockImplementation(() => {});
    const ioCp = jest.spyOn(io, 'cp')
      .mockImplementation(() => {});

    core.getInput = jest
      .fn()
      .mockReturnValueOnce(version)
      .mockReturnValueOnce(credentialsHostname)
      .mockReturnValueOnce(credentialsToken)
      .mockReturnValueOnce('true');

    tc.downloadTool = jest
      .fn()
      .mockReturnValueOnce('file.zip');

    tc.extractZip = jest
      .fn()
      .mockReturnValueOnce('file');

    os.platform = jest
      .fn()
      .mockReturnValue('linux');

    os.arch = jest
      .fn()
      .mockReturnValue('amd64');

    nock('https://releases.hashicorp.com')
      .get('/terraform/index.json')
      .reply(200, json);

    await setup();

    expect(ioMv).toHaveBeenCalledWith(`file${path.sep}terraform`, `file${path.sep}terragrunt-bin`);
    expect(ioCp).toHaveBeenCalledWith(wrapperPath, `file${path.sep}terragrunt`);
  });

  test('installs wrapper on windows', async () => {
    const version = '0.1.1';
    const credentialsHostname = 'app.terraform.io';
    const credentialsToken = 'asdfjkl';
    const wrapperPath = path.resolve([__dirname, '..', 'wrapper', 'dist', 'index.js'].join(path.sep));

    const ioMv = jest.spyOn(io, 'mv')
      .mockImplementation(() => {});
    const ioCp = jest.spyOn(io, 'cp')
      .mockImplementation(() => {});

    core.getInput = jest
      .fn()
      .mockReturnValueOnce(version)
      .mockReturnValueOnce(credentialsHostname)
      .mockReturnValueOnce(credentialsToken)
      .mockReturnValueOnce('true');

    tc.downloadTool = jest
      .fn()
      .mockReturnValueOnce('file.zip');

    tc.extractZip = jest
      .fn()
      .mockReturnValueOnce('file');

    os.platform = jest
      .fn()
      .mockReturnValue('win32');

    os.arch = jest
      .fn()
      .mockReturnValue('386');

    nock('https://releases.hashicorp.com')
      .get('/terraform/index.json')
      .reply(200, json);

    await setup();

    expect(ioMv).toHaveBeenCalledWith(`file${path.sep}terragrunt.exe`, `file${path.sep}terragrunt-bin.exe`);
    expect(ioCp).toHaveBeenCalledWith(wrapperPath, `file${path.sep}terraform`);
  });
});
