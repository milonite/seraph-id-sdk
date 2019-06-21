

<p align="center">
<img
    src="http://www.seraphid.io/assets/img/logo-dark.png"
    width="450px">
</p>
<h1></h1>
<p align="center">
  Seraph ID JavaScript SDK.
</p>

<p align="center">      
  <a href="https://github.com/swisscom-blockchain/seraph-id-sdk/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg?color=green">
  </a>
</p>

# Overview

This is the JavaScript SDK for Seraph ID - self-severeign identity solution on NEO blockchain platform. This project aims to be a lightweight and simple helper to use Seraph ID wallets, claims issuance and verification in the browser.

Visit the [Seraph ID](http://www.seraphid.io/) official web page to learn more about self-sovereign identity!

# Getting started

## Installation

### Node.js

```js
npm i seraph-id-sdk --save
```

## Usage

### Node.js

```js
var seraphId = require('seraph-id-sdk');
```

#### Seraph ID Owner

Create a new wallet:
```js
var wallet = new seraphId.SeraphIDWallet({ name: 'MyWallet' });
```

Generate a new DID:
```js
var myDID = wallet.createDID(); // e.g. did:neo:private:HMT5rCkqvjcjZZHQFvQtsX
```

Add a claim issued by Seraph ID issuer:
```js
wallet.addClaim(claim);
```

Encrypt and export wallet:
```js
wallet.encryptAll('password');
var exportedWalletJson = wallet.export();
```

Import wallet, decrypt it and get all claims of a specified DID or a claim by ID:
```js
var wallet = new seraphId.SeraphIDWallet(exportedWalletJson);
wallet.decryptAll('password');

var allClaims = wallet.getAllClaims('did:neo:private:HMT5rCkqvjcjZZHQFvQtsX');
var claim = wallet.getClaim('claimId');
```

#### Seraph ID Issuer

Create issuer instance:
```js
var issuer = new seraphId.SeraphIDIssuer('issuerSmartContractScriptHash', 'http://localhost:10332', 'http://localhost:4000/api/main_net');
```

Create a new (revokable) credentials schema:
```js
issuer.registerNewSchema('schemaName', ['firstName', 'lastName', 'age'], true);
```

Create and issue a claim: 
```js
var claim = issuer.createClaim('claimId', 'schemaName', {'firstName': 'John', 'lastName': 'Doe', 'age': 26}, 'did:neo:private:HMT5rCkqvjcjZZHQFvQtsX');

issuer.issueClaim(claim, 'issuerPrivateKey');
```

Revoke previously issued claim (if schema allows revocation):
```js
issuer.revokeClaimById('claimId');
```

#### Seraph ID Verifier

Create verifier instance:
```js
var verifier = new seraphId.SeraphIDVerifier('issuerSmartContractScriptHash', 'http://localhost:10332', 'http://localhost:4000/api/main_net');
```

Get meta-data of issuer's credentials schema:
```js
var schema = verifier.getSchemaDetails('schemaName');
```

Verify the given owner's claim offline (having issuer's public key):
```js
var verfied = verifier.verifyOffline(claim, 'issuerPublicKey');
```

Verify the given owner's claim online (calling issuer's smart contract):
```js
var verfied = verifier.verify(claim);
```

Validate the given owner's claim. Validation includes online verification, claim revocation and validity dates check. Optionally custom validation function can be passed.
```js
var valid = verifier.validateClaim(claim, function customClaimValidator(clm) {
    return clm.attributes.age > 18;
});
```


# Contributing

## Setup

This repository is a typescript repository using Yarn. Please ensure the following is installed:

- Yarn (v 1.16.0 or higher)
- Node (latest LTS)

```sh
git clone https://github.com/swisscom-blockchain/seraph-id-sdk.git
cd seraph-id-sdk
yarn
yarn build
```

## Testing

Before executing unit tests, please make sure to have:
- Issuer's smart contract deployed on your network.
- Network information and test data maintained properly in `__tests__/test-data.json` file.

```sh
yarn test
```

# License

- Open-source [MIT](https://github.com/swisscom-blockchain/seraph-id-sdk/blob/master/LICENSE).
