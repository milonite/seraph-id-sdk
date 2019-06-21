import { wallet } from '@cityofzion/neon-js';
import { ISchema } from '../common';
import { SeraphIDContract } from '../contract';
import { SeraphIDIssuer } from '../issuer';
import testData from './test-data.json';

const issuer = new SeraphIDIssuer(testData.scriptHash, testData.neoRpcUrl, testData.neoscanUrl);
const contract = new SeraphIDContract(testData.scriptHash, testData.neoRpcUrl, testData.neoscanUrl);

// Increase test suite timeout as we need to wait for block confirmation.
jest.setTimeout(240000);

// You can disable beforeAll if you don't intend to run tests that require certain claims and schemas to exist upfront.
beforeAll(async () => {
  // Create a new schema and wait for the next block
  const existingSchema: ISchema = testData.existingSchema;

  try {
    await contract.registerSchema(existingSchema, testData.issuerPrivateKey);
    await new Promise(r => setTimeout(r, testData.timeToWaitForBlockConfirmation));
  } catch (err) {
    // Do nothing, schema already exists. Otherwise existingSchema test will fail anyway.
  }
});

test('SeraphIDIssuer.sign + SeraphIDIssuer.verifyOffline', () => {
  const claim = issuer.createClaim(
    'TestClaimID123',
    testData.existingSchema.name,
    testData.claimAttributes,
    testData.issuerDID,
  );
  claim.issuerDID = testData.issuerDID;
  claim.signature = wallet.sign(issuer.getClaimHash(claim), testData.issuerPrivateKey);
  expect(issuer.verifyOffline(claim, testData.issuerPublicKey)).toBeTruthy();
});

// This tests all issueClaim, validate, validateClaimStructure, verify and verify offline methods.
test('SeraphIDIssuer.issueClaim.validate', async () => {
  let claim = issuer.createClaim(
    'TestClaim-' + new Date().getTime(),
    testData.existingSchema.name,
    testData.claimAttributes,
    testData.issuerDID,
  );
  claim = await issuer.issueClaim(claim, testData.issuerPrivateKey);

  expect(claim).toBeDefined();
  expect(claim.tx).toBeDefined();
  expect(claim.signature).toBeDefined();

  // wait for next block
  await new Promise(r => setTimeout(r, testData.timeToWaitForBlockConfirmation));
  const valid = await issuer.validateClaim(claim, clm => clm.attributes.age === testData.claimAttributes.age);
  expect(valid).toBeTruthy();
});
