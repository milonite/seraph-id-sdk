<p align="center">
<img src="https://www.seraphid.io/assets/img/logo-dark.png" width="450px"/>
</p>

<h1></h1>

<p align="center">Seraph ID DID Definition.</p>

# Abstract

To introduce Self-Sovereign Identity support in the NEO blockchain and enforce compatibility
with the raising standards we propose a DID method for NEO. The DID is a pre-requisite for the [Seraph ID](https://seraphid.io). 

The W3C Credentials Community Group [DIDs](https://w3c-ccg.github.io/did-spec/) standard was chosen for future interopability
with other Decentralized Identifier provider. The following DID Method will be registered on [DID Method Registry](https://w3c-ccg.github.io/did-method-registry/).

## NEO-DID Method Definition

### Context
As defined in the W3C Credentials Community Group [DIDs](https://w3c-ccg.github.io/did-spec/) standard the context is defined as

```json
{
  "@context": "https://w3id.org/did/v1"
}
```

### Subject
The Seraph ID subject is "neo" and the following format is required:

```json
did = "did:neo:" network ":" specific-idstring
network = ("test" / "main")
specific-idstring = NEO Public address (see below)
```

`specific-idstring` will be generated using a NEO Public address = `base58check(ScriptHash)`, where `ScriptHash = RIPMD160(SHA256(publicKey))`

```json
<pre>
{
  "id": "did:neo:main:AefrasH3wVfReDogQMx2LHq9o6XEAVTv8X"
}
```

### Public Keys
A public key section is defined in order to support encryption and cryptography operations.
The public key is generated accordingly to the NEO cryptography available support.
If the identity is public in the network (on-chain identity) then its smart contract public address will be also listed in the available public keys. 

```json
 "publicKey": [{
    "id": "did:neo:main:AefrasH3wVfReDogQMx2LHq9o6XEAVTv8X#keys-1",
    "type": "EdDsaSAPublicKeySecp256r1",
    "controller": "did:neo:AefrasH3wVfReDogQMx2LHq9o6XEAVTv8X",
    "publicKeyBase58": "H3C2AVvLMv6gmMNam3uVAjZpfkcJCwDwnZn6z3wXmqPV"
  },{
    "id": "did:neo:main:AefrasH3wVfReDogQMx2LHq9o6XEAVTv8X#keys-2",
    "type": "EdDsaSAPublicKeySecp256r1",
    "controller": "did:neo:AefrasH3wVfReDogQMx2LHq9o6XEAVTv8X",
    "publicKeyBase58": "J5D3ADfNNv6gmMAgNjZpfkcJCwDwnZn6x4FprfkcsADS"
  }]
```

### Service Endpoint
Given the versatile nature of NEO Seraph ID for public, on-chain identity, endpoint to interact with the identity itself is represented by a smart contract. For off-chain, discrete identity, using identity cloud manager, a specific endpoint is provided.

```json
  "service": [{
    "type": "smartContractService",
    "serviceEndpoint":"https://www.cloudservice1.org/me"
  },{
    "type": "cloudWallet",
    "serviceEndpoint":"https://me.cloudservice2.com"
  }]
```

## Method Example
The following example shows the extensive DID method definition proposed for a single, public, on-chain identity (e.g. Issuer).
```json
{
  "@context": "https://w3id.org/did/v1",
  "id": "did:neo:main:AefrasH3wVfReDogQMx2LHq9o6XEAVTv8X",
  "publicKey": [{
    "id": "did:neo:main:AefrasH3wVfReDogQMx2LHq9o6XEAVTv8X#keys-1",
    "type": "RsaVerificationKey2018",
    "controller": "did:neo:AefrasH3wVfReDogQMx2LHq9o6XEAVTv8X",
    "publicKeyBase58": "H3C2AVvLMv6gmMNam3uVAjZpfkcJCwDwnZn6z3wXmqPV"
  },{
    "id": "did:neo:main:AefrasH3wVfReDogQMx2LHq9o6XEAVTv8X#keys-2",
    "type": "RsaVerificationKey2018",
    "controller": "did:neo:AefrasH3wVfReDogQMx2LHq9o6XEAVTv8X",
    "publicKeyBase58": "J5D3ADfNNv6gmMAgNjZpfkcJCwDwnZn6x4FprfkcsADS"
  }],
  "service": [{
    "type": "smartContractService",
    "serviceEndpoint":"https://www.cloudservice1.org/me"
  },{
    "type": "CloudService",
    "serviceEndpoint":"https://me.cloudservice2.com"
  }]
}
```

# References
- Seraph ID official page: https://seraphid.io
- Seraph ID demo application on [GitHub](https://github.com/swisscom-blockchain/seraph-id-demo)
- Seraph ID SDK on [GitHub](https://github.com/swisscom-blockchain/seraph-id-sdk)
- Seraph ID smart contract templates and examples on [GitHub](https://github.com/swisscom-blockchain/seraph-id-smart-contracts)
