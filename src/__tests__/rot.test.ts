// Copyright (c) 2019 Swisscom Blockchain AG
// Licensed under MIT License

import { DIDNetwork } from '../common';
import { SeraphIDRootOfTrust } from '../rot';
import testData from './test-data.json';

const contract = new SeraphIDRootOfTrust(testData.rotScriptHash, testData.neoRpcUrl, testData.neoscanUrl, DIDNetwork.PrivateNet);

// Increase test suite timeout as we need to wait for block confirmation.
jest.setTimeout(240000);

afterAll(async done => {
  done();
});

test('SeraphIDRootOfTrust.getName', () => {
  expect(contract.getName()).resolves.toBe(testData.rotName);
});

test('SeraphIDRootOfTrust.getIssuerDID', () => {
  expect(contract.getDID()).toBe(testData.rotDID);
});

test('SeraphIDRootOfTrust.isTrusted.notTrusted', () => {
  const schemaName = 'TestInvalidSchema-' + new Date().getTime();
  expect(contract.isTrusted(testData.issuerDID, schemaName)).resolves.toBe(false);
});

test('SeraphIDRootOfTrust.registerIssuer.isTrusted.deactivated', async () => {
  const schemaName = 'TestSchema-' + new Date().getTime();
  await new Promise(r => setTimeout(r, testData.timeToWaitForBlockConfirmation));

  const tx = await contract.registerIssuer(testData.issuerDID, schemaName, testData.rotPrivateKey);
  expect(tx).toBeDefined();
  await new Promise(r => setTimeout(r, testData.timeToWaitForBlockConfirmation));
  await new Promise(r => setTimeout(r, testData.timeToWaitForBlockConfirmation));
  const isTrusted = await contract.isTrusted(testData.issuerDID, schemaName);
  expect(isTrusted).toBe(true);

  const tx2 = await contract.deactivateIssuer(testData.issuerDID, schemaName, testData.rotPrivateKey);
  expect(tx).toBeDefined();
  await new Promise(r => setTimeout(r, testData.timeToWaitForBlockConfirmation));

  const isTrusted2 = await contract.isTrusted(testData.issuerDID, schemaName);
  expect(isTrusted2).toBe(false);
});
