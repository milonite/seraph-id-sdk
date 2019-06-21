import { ISchema } from '../common';
import { SeraphIDContract } from '../contract';
import testData from './test-data.json';

const contract = new SeraphIDContract(testData.scriptHash, testData.neoRpcUrl, testData.neoscanUrl);

const NEW_SCHEMA_NAME = 'TestSchema-' + new Date().getTime();
const NONEXISTENT_SCHEMA_NAME = 'NonexistentSchema-' + new Date().getTime();
const INVALID_CLAIM_ID = 'InvalidClaim-' + new Date().getTime();
const NEW_CLAIM_ID = 'NewTestClaim-' + new Date().getTime();

// Increase test suite timeout as we need to wait for block confirmation.
jest.setTimeout(240000);

// You can disable beforeAll if you don't intend to run tests that require certain claims and schemas to exist upfront.
beforeAll(async () => {
  let waitForBlockConfirmation = false;
  // Create a new schema and wait for the next block
  const existingSchema: ISchema = testData.existingSchema;

  try {
    await contract.registerSchema(existingSchema, testData.issuerPrivateKey);
    waitForBlockConfirmation = true;
  } catch (err) {
    // Do nothing, schema already exists. Otherwise existingSchema test will fail anyway.
  }

  try {
    await contract.injectClaim(testData.validClaimId, testData.issuerPrivateKey);
    waitForBlockConfirmation = true;
  } catch (err) {
    // Do nothing, claim already exists. Otherwise validClaim test will fail anyway.
  }

  try {
    await contract.injectClaim(testData.existingClaimId, testData.issuerPrivateKey);
    waitForBlockConfirmation = true;
  } catch (err) {
    // Do nothing, claim already exists. Otherwise validClaim test will fail anyway.
  }

  if (waitForBlockConfirmation) {
    await new Promise(r => setTimeout(r, testData.timeToWaitForBlockConfirmation));
  }
});

afterAll(async done => {
  done();
});

test('SeraphIssuer.registerSchema', () => {
  const newSchema: ISchema = {
    attributes: testData.existingSchema.attributes,
    name: NEW_SCHEMA_NAME,
    revokable: true,
  };
  expect(contract.registerSchema(newSchema, testData.issuerPrivateKey)).resolves.toBeDefined();
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
  expect(contract.getSchemaDetails(NONEXISTENT_SCHEMA_NAME)).rejects.toThrowError();
});

test('SeraphIDContract.getSchemaDetails.existingSchema', () => {
  expect(contract.getSchemaDetails(testData.existingSchema.name)).resolves.toHaveProperty(
    'name',
    testData.existingSchema.name,
  );
});

test('SeraphIDContract.isValidClaim.invalidClaim', () => {
  expect(contract.isValidClaim(INVALID_CLAIM_ID)).resolves.toBe(false);
});

test('SeraphIDContract.isValidClaim.validClaim', () => {
  expect(contract.isValidClaim(testData.validClaimId)).resolves.toBe(true);
});

test('SeraphIDContract.injectClaim', async () => {
  await new Promise(r => setTimeout(r, testData.timeToWaitForBlockConfirmation));
  const result = await contract.injectClaim(NEW_CLAIM_ID, testData.issuerPrivateKey);
  expect(result).toBeDefined();
});

test('SeraphIDContract.revokeClaim', async () => {
  await new Promise(r => setTimeout(r, testData.timeToWaitForBlockConfirmation));
  const result = await contract.revokeClaim(NEW_CLAIM_ID, testData.issuerPrivateKey);
  expect(result).toBeDefined();
});
