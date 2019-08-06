// Copyright (c) 2019 Swisscom Blockchain AG
// Licensed under MIT License

/**
 * Claim schema meta data.
 */
export interface ISchema {
  attributes: string[];
  name: string;
  revokable: boolean;
  tx?: string;
}
/**
 * The claim.
 */
export interface IClaim {
  id: string;
  issuerDID?: string;
  ownerDID: string;
  attributes: { [key: string]: any };
  schema: string;
  signature?: string;
  tx?: string;
  validFrom?: Date;
  validTo?: Date;
}

/**
 * Result of Seraph ID smart contract operations invocation.
 * Used in case of errors or operations returning more complex structure.
 */
export interface IResult {
  success: boolean;
  error?: string;
  result?: any;
}

/**
 * Operation names in Issuer's smart contract.
 */
export enum IssuerOperation {
  GetSchemaDetails = 'GetSchemaDetails',
  RegisterSchema = 'RegisterSchema',
  InjectClaim = 'InjectClaim',
  RevokeClaim = 'RevokeClaim',
  IsValidClaim = 'IsValidClaim',
  PublicKey = 'PublicKey',
  Name = 'Name',
}

/**
 * Operation names in Root's of Trust smart contract.
 */
export enum RootOfTrustOperation {
  Name = 'Name',
  IsTrusted = 'IsTrusted',
  RegisterIssuer = 'RegisterIssuer',
  DeactivateIssuer = 'DeactivateIssuer',
}

/** Common NEO DID networks. */
export enum DIDNetwork {
  TestNet = 'test',
  MainNet = 'main',
  PrivateNet = 'priv',
}

/**
 * Seraph ID error definition.
 * Used across the library.
 */
export class SeraphIDError extends Error {
  constructor(message?: string, public readonly rpcResult?: any) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
