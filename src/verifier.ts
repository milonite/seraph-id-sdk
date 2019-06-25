import { u, wallet } from '@cityofzion/neon-core';
import { IClaim, ISchema, SeraphIDError } from './common';
import { SeraphIDIssuerContract } from './issuer-contract';
import { SeraphIDRootOfTrust } from './rot';

/**
 * Verifier's interface to verify and validate Seraph ID credentials.
 */
export class SeraphIDVerifier {
  // Smart contract interface of Seraph ID contract.
  protected contract: SeraphIDIssuerContract;

  /**
   * Default constructor.
   * @param scriptHash Script hash of issuer's smart contract.
   * @param networkRpcUrl URL to NEO RPC.
   * @param neoscanUrl URL to NEOSCAN API
   */
  constructor(
    protected readonly issuerScriptHash: string,
    protected readonly networkRpcUrl: string,
    protected readonly neoscanUrl: string,
  ) {
    this.contract = new SeraphIDIssuerContract(issuerScriptHash, networkRpcUrl, neoscanUrl);
  }

  /**
   * Verifies signature of the claim and Issuer's DID from Issuer's smart contract.
   * This does not validate the claim in any way (i.e. does not check if the claim was revoked or expired).
   * @param claim The claim to be verified.
   * @returns True if claim was successfully verified, false otherwise.
   */
  public async verify(claim: IClaim): Promise<boolean> {
    // verfiy Issuer's DID
    const issuerDID = await this.contract.getIssuerDID();

    if (claim.issuerDID !== issuerDID) {
      return false;
    }

    // Verify offline with valid Issuer's public key.
    const issuerPublicKey = await this.contract.getIssuerPublicKey();
    if (!this.verifyOffline(claim, issuerPublicKey)) {
      return false;
    }

    return true;
  }

  /**
   * Verifies signature of the claim offline.
   * This does not check Issuer's DID in issueing smart contract, nor it checks if the claim was revoked.
   * @param claim The claim to be verfied.
   * @param issuerPublicKey Issuer's public key to verify claim's signature.
   * @returns True if claim was successfully verified, false otherwise.
   */
  public verifyOffline(claim: IClaim, issuerPublicKey: string): boolean {
    if (!claim || !claim.signature || !claim.issuerDID || !claim.ownerDID) {
      return false;
    }

    // Check DIDs
    this.addressFromDID(claim.issuerDID);
    this.addressFromDID(claim.ownerDID);

    // validate signature
    const claimHash = this.getClaimHash(claim);
    return wallet.verify(claimHash, claim.signature, issuerPublicKey);
  }

  /**
   * Verifies and validates the given claim.
   * @param claim The claim to be validated.
   * @param validate Custom validator that can execute additional checks on claim's attributes.
   * @returns Validation result.
   */
  public async validateClaim(claim: IClaim, validate: (claim: IClaim) => boolean): Promise<boolean> {
    const now = new Date().getTime();
    const from = claim.validFrom ? claim.validFrom.getTime() : now;
    const to = claim.validTo ? claim.validTo.getTime() : now;

    return (
      from <= now &&
      now <= to &&
      (await this.verify(claim)) &&
      (await this.contract.isValidClaim(claim.id)) &&
      validate(claim)
    );
  }

  /**
   * Retrieves schema details from Issuer's smart contract.
   * @param name Schema name.
   * @returns Registered schema structure.
   */
  public async getSchemaDetails(name: string): Promise<ISchema> {
    return this.contract.getSchemaDetails(name);
  }

  /**
   * Checks if the given issuer with the schema name of claims he issues is trusted by RoT.
   * @param rotScriptHash Script hash of Root's of Trust smart contract.
   * @param issuerDID DID of the Issuer.
   * @param schemaName Name of the schema.
   * @returns True if issuer and their schema is trusted by RoT.
   */
  public async isIssuerTrusted(rotScriptHash: string, issuerDID: string, schemaName: string): Promise<boolean> {
    return new SeraphIDRootOfTrust(rotScriptHash, this.networkRpcUrl, this.neoscanUrl).isTrusted(issuerDID, schemaName);
  }

  /**
   * Calculates a hash of the given claim.
   * @param claim The claim.
   * @returns Hash of the given claim.
   */
  public getClaimHash(claim: IClaim): string {
    let claimString = '';
    claimString += claim.id;
    claimString += claim.issuerDID;
    claimString += claim.ownerDID;
    claimString += claim.schema;
    claimString += claim.validFrom != null ? claim.validFrom.getTime() : '';
    claimString += claim.validTo != null ? claim.validTo.getTime() : '';

    if (claim.attributes) {
      Object.keys(claim.attributes)
        .sort()
        .forEach(key => (claimString += JSON.stringify(claim.attributes[key])));
    }

    return u.hash256(claimString);
  }

  /**
   * Converts Seraph ID DID to NEO address of DID owner.
   * @param did Seraph ID DID.
   * @returns NEO Address of DID owner.
   */
  public addressFromDID(did: string): string {
    if (!did || !did.startsWith('did:neo:')) {
      throw new SeraphIDError(`${did} is not a valid Seraph ID DID.`);
    }

    const idx = did.lastIndexOf(':');
    if (did.length <= idx) {
      throw new SeraphIDError(`${did} is not a valid Seraph ID DID.`);
    }

    return did.substr(idx + 1);
  }
}
