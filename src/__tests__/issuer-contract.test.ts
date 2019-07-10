// Copyright (c) 2019 Swisscom Blockchain AG
// Licensed under MIT License

import { ISchema } from '../common';
import { SeraphIDIssuerContract } from '../issuer-contract';
import testData from './test-data.json';

const contract = new SeraphIDIssuerContract(testData.scriptHash, testData.neoRpcUrl, testData.neoscanUrl);

// Increase test suite timeout as we need to wait for block confirmation.
jest.setTimeout(240000);

afterAll(async done => {
  done();
});

test('SeraphIDContract.getIssuerName', () => {
  expect(contract.getIssuerName()).resolves.toBe(testData.issuerName);
});

test('SeraphIDContract.getIssuerDID', () => {
  expect(contract.getIssuerDID()).resolves.toBe(testData.issuerDID);
});

test('SeraphIDContract.getIssuerPublicKey', () => {
  expect(contract.getIssuerPublicKey()).resolves.toBe(testData.issuerPublicKey);
});

test('SeraphIDContract.getSchemaDetails.nonexistentSchema', () => {
  const nonExistentSchema = 'NonexistentSchema-' + new Date().getTime();
  expect(contract.getSchemaDetails(nonExistentSchema)).rejects.toThrowError();
});

test('SeraphIDContract.registerSchema.getSchemaDetails', async () => {
  const newSchemaName = 'TestSchema-' + new Date().getTime();
  const newSchema: ISchema = {
    attributes: testData.existingSchema.attributes,
    name: newSchemaName,
    revokable: true,
  };

  const tx = await contract.registerSchema(newSchema, testData.issuerPrivateKey);
  expect(tx).toBeDefined();

  await new Promise(r => setTimeout(r, testData.timeToWaitForBlockConfirmation));
  const schemaDetails = await contract.getSchemaDetails(newSchemaName);
  expect(schemaDetails).toHaveProperty('name', newSchemaName);
});

test('SeraphIDContract.isValidClaim.invalidClaim', () => {
  const invalidClaimId = 'InvalidClaim-' + new Date().getTime();
  expect(contract.isValidClaim(invalidClaimId)).resolves.toBe(false);
});

test('SeraphIDContract.injectClaim.validClaim.revokeClaim', async () => {
  await new Promise(r => setTimeout(r, testData.timeToWaitForBlockConfirmation));

  const newClaimId = 'NewTestClaim-' + new Date().getTime();
  const tx = await contract.injectClaim(newClaimId, testData.issuerPrivateKey);
  expect(tx).toBeDefined();

  await new Promise(r => setTimeout(r, testData.timeToWaitForBlockConfirmation));
  const isValid = await contract.isValidClaim(newClaimId);
  expect(isValid).toBe(true);

  const tx2 = await contract.revokeClaim(newClaimId, testData.issuerPrivateKey);
  expect(tx2).toBeDefined();

  await new Promise(r => setTimeout(r, testData.timeToWaitForBlockConfirmation));
  const isValid2 = await contract.isValidClaim(newClaimId);
  expect(isValid2).toBe(false);
});
