import { wallet } from '@cityofzion/neon-core';
import { IClaim } from '.';
import { ISeraphIDAccountJSON, SeraphIDAccount } from './account';
import { SeraphIDError } from './common';

/**
 * Seraph ID wallet as JSON.
 * Wallet in this form can be saved to a file or exported and imported later.
 * All claims inside are encrypted.
 */
export interface ISeraphIDWalletJSON extends wallet.WalletJSON {
  accounts: ISeraphIDAccountJSON[];
  didMap: { [did: string]: number };
}

/**
 * Wallet to store private keys and claims according to NEP-2 and NEP-9 respectively.
 */
export class SeraphIDWallet extends wallet.Wallet {
  // Array of accounts in the wallet.
  public accounts: SeraphIDAccount[];

  // Map from did to account index.
  public didMap: { [did: string]: number };

  /**
   * Default constructor.
   * @param obj Partial importable wallet.
   */
  constructor(obj: Partial<ISeraphIDWalletJSON>) {
    const tmpAccounts = obj.accounts || [];
    obj.accounts = undefined;
    super(obj);
    this.accounts = [];
    this.didMap = {};

    for (const acc of tmpAccounts) {
      this.addAccount(acc);
    }
  }

  /**
   * Adds a new account to this wallet.
   * @param acct The account to be added.
   * @returns The index of added account in the wallet.
   */
  public addAccount(acct: SeraphIDAccount | ISeraphIDAccountJSON): number {
    const index = this.accounts.length;
    if (!(acct instanceof SeraphIDAccount)) {
      acct = new SeraphIDAccount(acct);
    }

    this.accounts.push(acct);
    const did = this.getDID(index);

    if (did) {
      this.didMap[did] = index;
    }

    return index;
  }

  /**
   * Adds a claim to the wallet.
   * @param claim The claim to be added to the wallet.
   */
  public addClaim(claim: IClaim) {
    const acc = this.accounts[this.didMap[claim.ownerDID]];
    if (!acc) {
      throw new SeraphIDError(`DID account ${claim.ownerDID} is not a part of this wallet. Add account first.`);
    }

    acc.addClaim(claim);
  }

  /**
   * Returns a claim given a claim id.
   * @param claimId ID of the claim as given by the issuer.
   * @returns The claim if exists, undefined otherwise.
   */
  public getClaim(claimId: string): IClaim | undefined {
    for (const acc of this.accounts) {
      if (acc.getClaim(claimId)) {
        return acc.getClaim(claimId);
      }
    }
  }

  /**
   * Returns all the claims stored in this wallet for the given DID.
   * @param did The DID.
   * @returns An array of all the claims for given DID.
   */
  public getAllClaims(did: string): IClaim[] {
    const account = this.getAccountByDID(did);
    if (account) {
      return account.getAllClaims();
    }

    return [];
  }

  /**
   * Creates a new keyPair and associated DID.
   * @returns The generated DID string.
   */
  public createDID(): string {
    const privKey = wallet.generatePrivateKey();
    const acct = new SeraphIDAccount(privKey);
    this.addAccount(acct);

    return acct.getDID();
  }

  /**
   * Returns the DID for a given account index in the wallet.
   * @param index Index of the account to retrieve DID for.
   * @returns DID string if account exists, undefined otherwise.
   */
  public getDID(index: number): string | undefined {
    if (this.accounts[index]) {
      return this.accounts[index].getDID();
    }
  }

  /**
   * Returns the account associated with the given DID.
   * @param did The DID of the account to retrieve.
   * @returns Account associated with the DID.
   */
  public getAccountByDID(did: string): SeraphIDAccount | undefined {
    const idx = this.didMap[did];

    if (idx && this.accounts.length > idx) {
      return this.accounts[idx];
    }
  }

  /**
   * Returns an array of DIDs held in this wallet.
   * @returns An array of DIDs held in this wallet.
   */
  public getAllDIDs(): string[] {
    return Object.keys(this.didMap);
  }
}
