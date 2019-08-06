// Copyright (c) 2019 Swisscom Blockchain AG
// Licensed under MIT License

import { wallet } from '@cityofzion/neon-js';
import { DIDNetwork, ISchema } from '../common';
import { SeraphIDIssuer } from '../issuer';
import { SeraphIDIssuerContract } from '../issuer-contract';
import testData from './test-data.json';

const issuer = new SeraphIDIssuer(testData.scriptHash, testData.neoRpcUrl, testData.neoscanUrl, DIDNetwork.PrivateNet);
const contract = new SeraphIDIssuerContract(testData.scriptHash, testData.neoRpcUrl, testData.neoscanUrl, DIDNetwork.PrivateNet);

// Increase test suite timeout as we need to wait for block confirmation.
jest.setTimeout(240000);

test('SeraphIDIssuer.sign.verifyOffline', () => {
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
  const existingSchema: ISchema = testData.existingSchema;
  try {
    await contract.registerSchema(existingSchema, testData.issuerPrivateKey);
    await new Promise(r => setTimeout(r, testData.timeToWaitForBlockConfirmation));
  } catch (err) {
    // Do nothing, schema already exists.
  }

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

  await new Promise(r => setTimeout(r, testData.timeToWaitForBlockConfirmation));
  const valid = await issuer.validateClaim(claim, clm => clm.attributes.age === testData.claimAttributes.age);
  expect(valid).toBeTruthy();
});
