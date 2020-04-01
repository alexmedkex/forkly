import Web3 = require("web3");
import { BigNumber } from "bignumber.js";

type Address = string;
type TransactionOptions = Partial<Transaction>;
type UInt = number | BigNumber;

interface Transaction {
  hash: string;
  nonce: number;
  blockHash: string | null;
  blockNumber: number | null;
  transactionIndex: number | null;
  from: Address | ContractInstance;
  to: string | null;
  value: UInt;
  gasPrice: UInt;
  gas: number;
  input: string;
}

interface ContractInstance {
  address: string;
  sendTransaction(options?: TransactionOptions): Promise<void>;
}
export interface BytesUtilsInstance extends ContractInstance {}

export interface BytesUtilsMockInstance extends ContractInstance {
  split(
    data: string,
    skipStart: number,
    skipCount: number,
    options?: TransactionOptions
  ): Promise<string>;
}

export interface ContractChild1Instance extends ContractInstance {
  function2(a: number, b: number, options?: TransactionOptions): Promise<void>;
  function1(a: number, b: number, options?: TransactionOptions): Promise<void>;
  function3(a: number, b: number, options?: TransactionOptions): Promise<void>;
}

export interface ContractChild2Instance extends ContractInstance {
  function1(a: number, b: number, options?: TransactionOptions): Promise<void>;
  function2(a: number, b: number, options?: TransactionOptions): Promise<void>;
  function3(a: number, b: number, options?: TransactionOptions): Promise<void>;
  function4(a: number, b: number, options?: TransactionOptions): Promise<void>;
}

export interface ContractChild3Instance extends ContractInstance {
  function4(a: number, b: number, options?: TransactionOptions): Promise<void>;
  function1(a: number, b: number, options?: TransactionOptions): Promise<void>;
  function2(a: number, b: number, options?: TransactionOptions): Promise<void>;
  function3(a: number, b: number, options?: TransactionOptions): Promise<void>;
  function5(a: number, b: number, options?: TransactionOptions): Promise<void>;
}

export interface ContractLibraryInstance extends ContractInstance {
  owner(options?: TransactionOptions): Promise<Address>;
  transferOwnership(
    newOwner: Address,
    options?: TransactionOptions
  ): Promise<void>;

  register(
    name: string,
    version: number,
    createEventSigHash: string,
    contractABI: string,
    bytecode: string,
    activated: boolean,
    options?: TransactionOptions
  ): Promise<boolean>;
  activate(
    name: string,
    version: number,
    options?: TransactionOptions
  ): Promise<boolean>;
  deprecate(
    name: string,
    version: number,
    options?: TransactionOptions
  ): Promise<boolean>;
  deprecateAndActivateLatest(
    name: string,
    version: number,
    options?: TransactionOptions
  ): Promise<boolean>;
  getBytecode(name: string, options?: TransactionOptions): Promise<string>;
  getBytecode(
    name: string,
    version: number,
    options?: TransactionOptions
  ): Promise<string>;
  getABI(name: string, options?: TransactionOptions): Promise<string>;
  getABI(
    name: string,
    version: number,
    options?: TransactionOptions
  ): Promise<string>;
  getContractInfo(
    name: string,
    version: number,
    options?: TransactionOptions
  ): Promise<any>;
  getContractInfo(name: string, options?: TransactionOptions): Promise<any>;
  getContractInfoByBytecodeHash(
    bytecodeHash: string,
    options?: TransactionOptions
  ): Promise<any>;
  isExistingCreateEventSigHash(
    sigHash: string,
    options?: TransactionOptions
  ): Promise<boolean>;
  getCastEventSigHash(options?: TransactionOptions): Promise<string>;
}

export interface ContractParentInstance extends ContractInstance {
  function1(a: number, b: number, options?: TransactionOptions): Promise<void>;
  function2(a: number, b: number, options?: TransactionOptions): Promise<void>;
}

export interface ContractParent2Instance extends ContractInstance {
  function4(a: number, b: number, options?: TransactionOptions): Promise<void>;
  function5(a: number, b: number, options?: TransactionOptions): Promise<void>;
}

export interface ContractChild1Instance extends ContractInstance {
  function2(a: number, b: number, options?: TransactionOptions): Promise<void>;
  function1(a: number, b: number, options?: TransactionOptions): Promise<void>;
  function3(a: number, b: number, options?: TransactionOptions): Promise<void>;
}

export interface ContractChild2Instance extends ContractInstance {
  function1(a: number, b: number, options?: TransactionOptions): Promise<void>;
  function2(a: number, b: number, options?: TransactionOptions): Promise<void>;
  function3(a: number, b: number, options?: TransactionOptions): Promise<void>;
  function4(a: number, b: number, options?: TransactionOptions): Promise<void>;
}

export interface ContractChild3Instance extends ContractInstance {
  function4(a: number, b: number, options?: TransactionOptions): Promise<void>;
  function1(a: number, b: number, options?: TransactionOptions): Promise<void>;
  function2(a: number, b: number, options?: TransactionOptions): Promise<void>;
  function3(a: number, b: number, options?: TransactionOptions): Promise<void>;
  function5(a: number, b: number, options?: TransactionOptions): Promise<void>;
}

export interface ContractLibraryInstance extends ContractInstance {
  owner(options?: TransactionOptions): Promise<Address>;
  transferOwnership(
    newOwner: Address,
    options?: TransactionOptions
  ): Promise<void>;

  register(
    name: string,
    version: number,
    createEventSigHash: string,
    contractABI: string,
    bytecode: string,
    activated: boolean,
    options?: TransactionOptions
  ): Promise<boolean>;
  activate(
    name: string,
    version: number,
    options?: TransactionOptions
  ): Promise<boolean>;
  deprecate(
    name: string,
    version: number,
    options?: TransactionOptions
  ): Promise<boolean>;
  deprecateAndActivateLatest(
    name: string,
    version: number,
    options?: TransactionOptions
  ): Promise<boolean>;
  getBytecode(
    name: string,
    version: number,
    options?: TransactionOptions
  ): Promise<string>;
  getBytecode(name: string, options?: TransactionOptions): Promise<string>;
  getABI(
    name: string,
    version: number,
    options?: TransactionOptions
  ): Promise<string>;
  getABI(name: string, options?: TransactionOptions): Promise<string>;
  getContractInfo(
    name: string,
    version: number,
    options?: TransactionOptions
  ): Promise<any>;
  getContractInfo(name: string, options?: TransactionOptions): Promise<any>;
  getContractInfoByBytecodeHash(
    bytecodeHash: string,
    options?: TransactionOptions
  ): Promise<any>;
  isExistingCreateEventSigHash(
    sigHash: string,
    options?: TransactionOptions
  ): Promise<boolean>;
  getCastEventSigHash(options?: TransactionOptions): Promise<string>;
}

export interface ContractParentInstance extends ContractInstance {
  function1(a: number, b: number, options?: TransactionOptions): Promise<void>;
  function2(a: number, b: number, options?: TransactionOptions): Promise<void>;
}

export interface ContractParent2Instance extends ContractInstance {
  function4(a: number, b: number, options?: TransactionOptions): Promise<void>;
  function5(a: number, b: number, options?: TransactionOptions): Promise<void>;
}


export interface DocumentRegistryInstance extends ContractInstance {
  isValidAddress(
    address: Address,
    options?: TransactionOptions
  ): Promise<[string, boolean]>;
  proxiableUUID(options?: TransactionOptions): Promise<string>;
  PERMISSION_CHECKER_NODE(options?: TransactionOptions): Promise<string>;
  owner(options?: TransactionOptions): Promise<Address>;
  transferOwnership(
    newOwner: Address,
    options?: TransactionOptions
  ): Promise<void>;

  publishDocumentHash(
    newHash: string,
    docId: string,
    options?: TransactionOptions
  ): Promise<void>;
  register(hashes: string[], options?: TransactionOptions): Promise<void>;
  getRegistrationInfo(
    hash: string,
    options?: TransactionOptions
  ): Promise<[string, BigNumber]>;
  updateImplementation(
    newDocumentRegistry: Address,
    options?: TransactionOptions
  ): Promise<void>;
  initialise(ensRegistry: Address, options?: TransactionOptions): Promise<void>;
}

export interface DocumentRegistryProxyInstance extends ContractInstance {
  isValidAddress(
    address: Address,
    options?: TransactionOptions
  ): Promise<[string, boolean]>;
  PERMISSION_CHECKER_NODE(options?: TransactionOptions): Promise<string>;
  owner(options?: TransactionOptions): Promise<Address>;
  transferOwnership(
    newOwner: Address,
    options?: TransactionOptions
  ): Promise<void>;
}

export interface ENSInstance extends ContractInstance {
  setSubnodeOwner(
    node: string,
    label: string,
    owner: Address,
    options?: TransactionOptions
  ): Promise<void>;
  setResolver(
    node: string,
    resolver: Address,
    options?: TransactionOptions
  ): Promise<void>;
  setOwner(
    node: string,
    owner: Address,
    options?: TransactionOptions
  ): Promise<void>;
  setTTL(
    node: string,
    ttl: number,
    options?: TransactionOptions
  ): Promise<void>;
  owner(node: string, options?: TransactionOptions): Promise<Address>;
  resolver(node: string, options?: TransactionOptions): Promise<Address>;
  ttl(node: string, options?: TransactionOptions): Promise<BigNumber>;
}

export interface ENSRegistryInstance extends ContractInstance {
  setOwner(
    node: string,
    owner: Address,
    options?: TransactionOptions
  ): Promise<void>;
  setSubnodeOwner(
    node: string,
    label: string,
    owner: Address,
    options?: TransactionOptions
  ): Promise<void>;
  setResolver(
    node: string,
    resolver: Address,
    options?: TransactionOptions
  ): Promise<void>;
  setTTL(
    node: string,
    ttl: number,
    options?: TransactionOptions
  ): Promise<void>;
  owner(node: string, options?: TransactionOptions): Promise<Address>;
  resolver(node: string, options?: TransactionOptions): Promise<Address>;
  ttl(node: string, options?: TransactionOptions): Promise<BigNumber>;
}

export interface FiniteStateMachineInstance extends ContractInstance {
  isValidAddress(
    address: Address,
    options?: TransactionOptions
  ): Promise<[string, boolean]>;
  getVersion(options?: TransactionOptions): Promise<BigNumber>;
  partyRolesByGuid(
    unnamed0: string,
    unnamed1: number,
    options?: TransactionOptions
  ): Promise<string>;
  partyGuidByRole(
    unnamed2: string,
    options?: TransactionOptions
  ): Promise<string>;
  version(options?: TransactionOptions): Promise<BigNumber>;
  PERMISSION_CHECKER_NODE(options?: TransactionOptions): Promise<string>;
  currentStateId(options?: TransactionOptions): Promise<string>;
  nonce(options?: TransactionOptions): Promise<BigNumber>;
  contractEmitterName(options?: TransactionOptions): Promise<string>;

  setData(
    v: number,
    r: string,
    s: string,
    key: string,
    value: string,
    options?: TransactionOptions
  ): Promise<void>;
  getData(key: string, options?: TransactionOptions): Promise<string>;
  getParty(role: string, options?: TransactionOptions): Promise<string>;
  canCallFunction(
    stateId: string,
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<boolean>;
}

export interface FiniteStateMachineMockInstance extends ContractInstance {
  isValidAddress(
    address: Address,
    options?: TransactionOptions
  ): Promise<[string, boolean]>;
  getVersion(options?: TransactionOptions): Promise<BigNumber>;
  partyRolesByGuid(
    unnamed3: string,
    unnamed4: number,
    options?: TransactionOptions
  ): Promise<string>;
  partyGuidByRole(
    unnamed5: string,
    options?: TransactionOptions
  ): Promise<string>;
  getData(key: string, options?: TransactionOptions): Promise<string>;
  version(options?: TransactionOptions): Promise<BigNumber>;
  getParty(role: string, options?: TransactionOptions): Promise<string>;
  canCallFunction(
    stateId: string,
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<boolean>;
  PERMISSION_CHECKER_NODE(options?: TransactionOptions): Promise<string>;
  currentStateId(options?: TransactionOptions): Promise<string>;
  numberOfStates(options?: TransactionOptions): Promise<BigNumber>;
  nonce(options?: TransactionOptions): Promise<BigNumber>;
  numberOfParties(options?: TransactionOptions): Promise<BigNumber>;
  contractEmitterName(options?: TransactionOptions): Promise<string>;
  allowedFunctionSelector(options?: TransactionOptions): Promise<string>;
  callbackCalled(options?: TransactionOptions): Promise<boolean>;
  setData(
    v: number,
    r: string,
    s: string,
    key: string,
    value: string,
    options?: TransactionOptions
  ): Promise<void>;

  initHelper(options?: TransactionOptions): Promise<void>;
  setStatesHelper(
    states: string[],
    options?: TransactionOptions
  ): Promise<void>;
  setPartyRolesHelper(
    parties: string[],
    options?: TransactionOptions
  ): Promise<void>;
  addAllowedStateHelper(
    stateId: string,
    nextState: string,
    options?: TransactionOptions
  ): Promise<void>;
  addAllowedFunctionHelper(
    stateId: string,
    partyRole: string,
    selector: string,
    options?: TransactionOptions
  ): Promise<void>;
  addAllowedFieldEditHelper(
    stateId: string,
    partyRole: string,
    dataFields: string[],
    options?: TransactionOptions
  ): Promise<void>;
  addAllowedSingleFieldEditHelper(
    stateId: string,
    partyRole: string,
    dataField: string,
    options?: TransactionOptions
  ): Promise<void>;
  setDummyCallback(
    stateId: string,
    options?: TransactionOptions
  ): Promise<void>;
  transitionToStateHelper(
    newState: string,
    options?: TransactionOptions
  ): Promise<void>;
  dummyAllowedFunction(
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<void>;
  addStartConditionHelperTrue(
    state: string,
    options?: TransactionOptions
  ): Promise<void>;
  addStartConditionHelperFalse(
    state: string,
    options?: TransactionOptions
  ): Promise<void>;
  setPartyInternalHelper(
    role: string,
    partyGuid: string,
    options?: TransactionOptions
  ): Promise<void>;
  setDataInternalHelper(
    key: string,
    value: string,
    signerGuid: string,
    options?: TransactionOptions
  ): Promise<void>;
  getSignerGuidHelper(
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<string>;
}

export interface ICastEventEmitterInstance extends ContractInstance {}

export interface ILCInstance extends ContractInstance {
  getCurrentStateId(options?: TransactionOptions): Promise<string>;
  getApplicant(options?: TransactionOptions): Promise<string>;
  getBeneficiary(options?: TransactionOptions): Promise<string>;
  getIssuingBank(options?: TransactionOptions): Promise<string>;
  getAdvisingBank(options?: TransactionOptions): Promise<string>;
  getCreatorGuid(options?: TransactionOptions): Promise<string>;
  getCommercialContractDocumentHash(
    options?: TransactionOptions
  ): Promise<string>;
  getLCDraftDocumentHash(options?: TransactionOptions): Promise<string>;
  request(
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<void>;
  issue(
    v: number,
    r: string,
    s: string,
    mt700Hash: string,
    docReference: string,
    options?: TransactionOptions
  ): Promise<void>;
  requestReject(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issuedLCRejectByBeneficiary(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issuedLCRejectByAdvisingBank(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  advise(
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<void>;
  acknowledge(
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<void>;
  addLCPresentation(
    lcPresentationAddress: Address,
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<void>;
  getLCPresentations(options?: TransactionOptions): Promise<Address[]>;
}

export interface ILCAmendmentInstance extends ContractInstance {
  getCurrentStateId(options?: TransactionOptions): Promise<string>;
  getApplicant(options?: TransactionOptions): Promise<string>;
  getBeneficiary(options?: TransactionOptions): Promise<string>;
  getIssuingBank(options?: TransactionOptions): Promise<string>;
  getAdvisingBank(options?: TransactionOptions): Promise<string>;
  getCreatorGuid(options?: TransactionOptions): Promise<string>;
}

export interface ILCPresentationInstance extends ContractInstance {
  getCurrentStateId(options?: TransactionOptions): Promise<string>;
  getApplicant(options?: TransactionOptions): Promise<string>;
  getBeneficiary(options?: TransactionOptions): Promise<string>;
  getIssuingBank(options?: TransactionOptions): Promise<string>;
  getNominatedBank(options?: TransactionOptions): Promise<string>;
  getCreatorGuid(options?: TransactionOptions): Promise<string>;
  getDocumentBy(
    documentKey: string,
    options?: TransactionOptions
  ): Promise<string>;
  nominatedBankSetDocumentsCompliant(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  nominatedBankSetDocumentsDiscrepant(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issuingBankSetDocumentsCompliant(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issuingBankSetDocumentsDiscrepant(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  nominatedBankAdviseDiscrepancies(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issungBankAdviseDiscrepancies(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issuingBankSetDiscrepanciesAccepted(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issuingBankSetDiscrepanciesRejected(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  applicantSetDiscrepanciesAccepted(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  applicantSetDiscrepanciesRejected(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
}

export interface ISBLCInstance extends ContractInstance {
  getCurrentStateId(options?: TransactionOptions): Promise<string>;
  getApplicant(options?: TransactionOptions): Promise<string>;
  getBeneficiary(options?: TransactionOptions): Promise<string>;
  getIssuingBank(options?: TransactionOptions): Promise<string>;
  getAdvisingBank(options?: TransactionOptions): Promise<string>;
  getCreatorGuid(options?: TransactionOptions): Promise<string>;
  getCommercialContractDocumentHash(
    options?: TransactionOptions
  ): Promise<string>;
  getSBLCDraftDocumentHash(options?: TransactionOptions): Promise<string>;
  request(
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<void>;
  issue(
    v: number,
    r: string,
    s: string,
    mt700Hash: string,
    docReference: string,
    options?: TransactionOptions
  ): Promise<void>;
  requestReject(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issuedSBLCRejectByBeneficiary(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issuedSBLCRejectByAdvisingBank(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  advise(
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<void>;
  acknowledge(
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<void>;
}

export interface ICastEventEmitterInstance extends ContractInstance {}

export interface ILCInstance extends ContractInstance {
  getCurrentStateId(options?: TransactionOptions): Promise<string>;
  getApplicant(options?: TransactionOptions): Promise<string>;
  getBeneficiary(options?: TransactionOptions): Promise<string>;
  getIssuingBank(options?: TransactionOptions): Promise<string>;
  getAdvisingBank(options?: TransactionOptions): Promise<string>;
  getCreatorGuid(options?: TransactionOptions): Promise<string>;
  getCommercialContractDocumentHash(
    options?: TransactionOptions
  ): Promise<string>;
  getLCDraftDocumentHash(options?: TransactionOptions): Promise<string>;
  request(
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<void>;
  issue(
    v: number,
    r: string,
    s: string,
    mt700Hash: string,
    docReference: string,
    options?: TransactionOptions
  ): Promise<void>;
  requestReject(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issuedLCRejectByBeneficiary(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issuedLCRejectByAdvisingBank(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  advise(
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<void>;
  acknowledge(
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<void>;
  addLCPresentation(
    lcPresentationAddress: Address,
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<void>;
  getLCPresentations(options?: TransactionOptions): Promise<Address[]>;
}

export interface ILCAmendmentInstance extends ContractInstance {
  getCurrentStateId(options?: TransactionOptions): Promise<string>;
  getApplicant(options?: TransactionOptions): Promise<string>;
  getBeneficiary(options?: TransactionOptions): Promise<string>;
  getIssuingBank(options?: TransactionOptions): Promise<string>;
  getAdvisingBank(options?: TransactionOptions): Promise<string>;
  getCreatorGuid(options?: TransactionOptions): Promise<string>;
}

export interface ILCPresentationInstance extends ContractInstance {
  getCurrentStateId(options?: TransactionOptions): Promise<string>;
  getApplicant(options?: TransactionOptions): Promise<string>;
  getBeneficiary(options?: TransactionOptions): Promise<string>;
  getIssuingBank(options?: TransactionOptions): Promise<string>;
  getNominatedBank(options?: TransactionOptions): Promise<string>;
  getCreatorGuid(options?: TransactionOptions): Promise<string>;
  getDocumentBy(
    documentKey: string,
    options?: TransactionOptions
  ): Promise<string>;
  nominatedBankSetDocumentsCompliant(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  nominatedBankSetDocumentsDiscrepant(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issuingBankSetDocumentsCompliant(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issuingBankSetDocumentsDiscrepant(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  nominatedBankAdviseDiscrepancies(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issungBankAdviseDiscrepancies(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issuingBankSetDiscrepanciesAccepted(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issuingBankSetDiscrepanciesRejected(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  applicantSetDiscrepanciesAccepted(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  applicantSetDiscrepanciesRejected(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
}

export interface ISBLCInstance extends ContractInstance {
  getCurrentStateId(options?: TransactionOptions): Promise<string>;
  getApplicant(options?: TransactionOptions): Promise<string>;
  getBeneficiary(options?: TransactionOptions): Promise<string>;
  getIssuingBank(options?: TransactionOptions): Promise<string>;
  getAdvisingBank(options?: TransactionOptions): Promise<string>;
  getCreatorGuid(options?: TransactionOptions): Promise<string>;
  getCommercialContractDocumentHash(
    options?: TransactionOptions
  ): Promise<string>;
  getSBLCDraftDocumentHash(options?: TransactionOptions): Promise<string>;
  request(
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<void>;
  issue(
    v: number,
    r: string,
    s: string,
    mt700Hash: string,
    docReference: string,
    options?: TransactionOptions
  ): Promise<void>;
  requestReject(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issuedSBLCRejectByBeneficiary(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issuedSBLCRejectByAdvisingBank(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  advise(
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<void>;
  acknowledge(
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<void>;
}

export interface IVersionableInstance extends ContractInstance {
  getVersion(options?: TransactionOptions): Promise<BigNumber>;
}

export interface KomgoMetaResolverInstance extends ContractInstance {
  updateImplementation(
    newResolver: Address,
    options?: TransactionOptions
  ): Promise<void>;
  ABI(
    node: string,
    contentTypes: number,
    options?: TransactionOptions
  ): Promise<[BigNumber, string]>;
  addr(node: string, options?: TransactionOptions): Promise<Address>;
  proxiableUUID(options?: TransactionOptions): Promise<string>;
  setABI(
    node: string,
    contentType: number,
    data: string,
    options?: TransactionOptions
  ): Promise<void>;
  owner(options?: TransactionOptions): Promise<Address>;
  initialise(ensAddr: Address, options?: TransactionOptions): Promise<void>;
  setAddr(
    node: string,
    addr: Address,
    options?: TransactionOptions
  ): Promise<void>;
  transferOwnership(
    newOwner: Address,
    options?: TransactionOptions
  ): Promise<void>;

  addEthereumPublicKey(
    node: string,
    xPublicKey: string,
    yPublicKey: string,
    termDate: number,
    options?: TransactionOptions
  ): Promise<void>;
  addKomgoMessagingPublicKey(
    node: string,
    jwk: string,
    termDate: number,
    options?: TransactionOptions
  ): Promise<void>;
  addVaktMessagingPublicKey(
    node: string,
    jwk: string,
    termDate: number,
    options?: TransactionOptions
  ): Promise<void>;
  revokeEthereumPublicKey(
    node: string,
    index: number,
    options?: TransactionOptions
  ): Promise<void>;
  revokeKomgoMessagingPublicKey(
    node: string,
    index: number,
    options?: TransactionOptions
  ): Promise<void>;
  revokeVaktMessagingPublicKey(
    node: string,
    index: number,
    options?: TransactionOptions
  ): Promise<void>;
  setText(
    node: string,
    key: string,
    value: string,
    options?: TransactionOptions
  ): Promise<void>;
  text(
    node: string,
    key: string,
    options?: TransactionOptions
  ): Promise<string>;
  currentEthereumPublicKey(
    node: string,
    index: number,
    options?: TransactionOptions
  ): Promise<[string, string, BigNumber, BigNumber, boolean, boolean]>;
  ethereumPublicKeysLength(
    node: string,
    options?: TransactionOptions
  ): Promise<BigNumber>;
  currentKomgoMessagingPublicKey(
    node: string,
    index: number,
    options?: TransactionOptions
  ): Promise<[string, BigNumber, BigNumber, boolean, boolean]>;
  komgoMessagingPublicKeysLength(
    node: string,
    options?: TransactionOptions
  ): Promise<BigNumber>;
  currentVaktMessagingPublicKey(
    node: string,
    index: number,
    options?: TransactionOptions
  ): Promise<[string, BigNumber, BigNumber, boolean, boolean]>;
  vaktMessagingPublicKeysLength(
    node: string,
    options?: TransactionOptions
  ): Promise<BigNumber>;
  reverseNode(node: string, options?: TransactionOptions): Promise<string>;
  staticId(node: string, options?: TransactionOptions): Promise<string>;
  komgoMnid(node: string, options?: TransactionOptions): Promise<string>;
  vaktMnid(node: string, options?: TransactionOptions): Promise<string>;
  x500Name(node: string, options?: TransactionOptions): Promise<string>;
  nodeKeys(node: string, options?: TransactionOptions): Promise<string>;
  products(node: string, options?: TransactionOptions): Promise<string>;
  vaktStaticId(node: string, options?: TransactionOptions): Promise<string>;
  isDeactivated(node: string, options?: TransactionOptions): Promise<string>;
  hasSWIFTKey(node: string, options?: TransactionOptions): Promise<string>;
  isFinancialInstitution(
    node: string,
    options?: TransactionOptions
  ): Promise<string>;
  isMember(node: string, options?: TransactionOptions): Promise<string>;
  legalEntityName(node: string, options?: TransactionOptions): Promise<string>;
}

export interface KomgoMetaResolverProxyInstance extends ContractInstance {
  owner(options?: TransactionOptions): Promise<Address>;
  transferOwnership(
    newOwner: Address,
    options?: TransactionOptions
  ): Promise<void>;
}

export interface KomgoMetaResolverV2Instance extends ContractInstance {
  updateImplementation(
    newResolver: Address,
    options?: TransactionOptions
  ): Promise<void>;
  legalEntityName(node: string, options?: TransactionOptions): Promise<string>;
  setText(
    node: string,
    key: string,
    value: string,
    options?: TransactionOptions
  ): Promise<void>;
  vaktMessagingPublicKeysLength(
    node: string,
    options?: TransactionOptions
  ): Promise<BigNumber>;
  ABI(
    node: string,
    contentTypes: number,
    options?: TransactionOptions
  ): Promise<[BigNumber, string]>;
  ethereumPublicKeysLength(
    node: string,
    options?: TransactionOptions
  ): Promise<BigNumber>;
  addr(node: string, options?: TransactionOptions): Promise<Address>;
  addKomgoMessagingPublicKey(
    node: string,
    jwk: string,
    termDate: number,
    options?: TransactionOptions
  ): Promise<void>;
  isMember(node: string, options?: TransactionOptions): Promise<string>;
  proxiableUUID(options?: TransactionOptions): Promise<string>;
  currentVaktMessagingPublicKey(
    node: string,
    index: number,
    options?: TransactionOptions
  ): Promise<[string, BigNumber, BigNumber, boolean, boolean]>;
  x500Name(node: string, options?: TransactionOptions): Promise<string>;
  text(
    node: string,
    key: string,
    options?: TransactionOptions
  ): Promise<string>;
  setABI(
    node: string,
    contentType: number,
    data: string,
    options?: TransactionOptions
  ): Promise<void>;
  reverseNode(node: string, options?: TransactionOptions): Promise<string>;
  currentKomgoMessagingPublicKey(
    node: string,
    index: number,
    options?: TransactionOptions
  ): Promise<[string, BigNumber, BigNumber, boolean, boolean]>;
  products(node: string, options?: TransactionOptions): Promise<string>;
  currentEthereumPublicKey(
    node: string,
    index: number,
    options?: TransactionOptions
  ): Promise<[string, string, BigNumber, BigNumber, boolean, boolean]>;
  isFinancialInstitution(
    node: string,
    options?: TransactionOptions
  ): Promise<string>;
  revokeEthereumPublicKey(
    node: string,
    index: number,
    options?: TransactionOptions
  ): Promise<void>;
  owner(options?: TransactionOptions): Promise<Address>;
  nodeKeys(node: string, options?: TransactionOptions): Promise<string>;
  revokeKomgoMessagingPublicKey(
    node: string,
    index: number,
    options?: TransactionOptions
  ): Promise<void>;
  hasSWIFTKey(node: string, options?: TransactionOptions): Promise<string>;
  initialise(ensAddr: Address, options?: TransactionOptions): Promise<void>;
  revokeVaktMessagingPublicKey(
    node: string,
    index: number,
    options?: TransactionOptions
  ): Promise<void>;
  vaktMnid(node: string, options?: TransactionOptions): Promise<string>;
  vaktStaticId(node: string, options?: TransactionOptions): Promise<string>;
  addEthereumPublicKey(
    node: string,
    xPublicKey: string,
    yPublicKey: string,
    termDate: number,
    options?: TransactionOptions
  ): Promise<void>;
  komgoMessagingPublicKeysLength(
    node: string,
    options?: TransactionOptions
  ): Promise<BigNumber>;
  staticId(node: string, options?: TransactionOptions): Promise<string>;
  isDeactivated(node: string, options?: TransactionOptions): Promise<string>;
  setAddr(
    node: string,
    addr: Address,
    options?: TransactionOptions
  ): Promise<void>;
  addVaktMessagingPublicKey(
    node: string,
    jwk: string,
    termDate: number,
    options?: TransactionOptions
  ): Promise<void>;
  komgoMnid(node: string, options?: TransactionOptions): Promise<string>;
  transferOwnership(
    newOwner: Address,
    options?: TransactionOptions
  ): Promise<void>;

  isLightNode(node: string, options?: TransactionOptions): Promise<string>;
}

export interface KomgoOnboarderInstance extends ContractInstance {
  komgoMetaResolver(options?: TransactionOptions): Promise<Address>;
  owner(options?: TransactionOptions): Promise<Address>;
  transferOwnership(
    newOwner: Address,
    options?: TransactionOptions
  ): Promise<void>;

  addCompanyOnboardingInformation(
    onboardInfo: {
      node: string;
      ethPubKey: { publicKey: { x: string; y: string }; termDate: number };
      textEntries: { key: string; value: string }[];
      komgoMessagingPubKey: { key: string; termDate: number };
      vaktMessagingPubKey: { key: string; termDate: number };
    },
    options?: TransactionOptions
  ): Promise<boolean>;
  addCompaniesOnboardingInformation(
    onboardInformation: {
      node: string;
      ethPubKey: { publicKey: { x: string; y: string }; termDate: number };
      textEntries: { key: string; value: string }[];
      komgoMessagingPubKey: { key: string; termDate: number };
      vaktMessagingPubKey: { key: string; termDate: number };
    }[],
    options?: TransactionOptions
  ): Promise<boolean>;
}

export interface KomgoRegistrarInstance extends ContractInstance {
  rootDomain(options?: TransactionOptions): Promise<string>;
  metaDomain(options?: TransactionOptions): Promise<string>;
  komgoResolver(options?: TransactionOptions): Promise<Address>;
  komgoMetaResolver(options?: TransactionOptions): Promise<Address>;
  owner(options?: TransactionOptions): Promise<Address>;
  transferOwnership(
    newOwner: Address,
    options?: TransactionOptions
  ): Promise<void>;

  register(
    subDomain: string,
    nodeOwner: Address,
    options?: TransactionOptions
  ): Promise<void>;
  registerAndSetResolvers(
    companyLabelHash: string,
    nodeOwner: Address,
    options?: TransactionOptions
  ): Promise<void>;
  setResolverAddress(
    newAddress: Address,
    options?: TransactionOptions
  ): Promise<void>;
  setMetaResolverAddress(
    newAddress: Address,
    options?: TransactionOptions
  ): Promise<void>;
}

export interface KomgoResolverInstance extends ContractInstance {
  proxiableUUID(options?: TransactionOptions): Promise<string>;
  owner(options?: TransactionOptions): Promise<Address>;
  transferOwnership(
    newOwner: Address,
    options?: TransactionOptions
  ): Promise<void>;

  initialise(ensAddr: Address, options?: TransactionOptions): Promise<void>;
  updateImplementation(
    newResolver: Address,
    options?: TransactionOptions
  ): Promise<void>;
  setAddr(
    node: string,
    addr: Address,
    options?: TransactionOptions
  ): Promise<void>;
  setABI(
    node: string,
    contentType: number,
    data: string,
    options?: TransactionOptions
  ): Promise<void>;
  ABI(
    node: string,
    contentTypes: number,
    options?: TransactionOptions
  ): Promise<[BigNumber, string]>;
  addr(node: string, options?: TransactionOptions): Promise<Address>;
}

export interface LCInstance extends ContractInstance {
  isValidAddress(
    address: Address,
    options?: TransactionOptions
  ): Promise<[string, boolean]>;
  getVersion(options?: TransactionOptions): Promise<BigNumber>;
  partyRolesByGuid(
    unnamed6: string,
    unnamed7: number,
    options?: TransactionOptions
  ): Promise<string>;
  partyGuidByRole(
    unnamed8: string,
    options?: TransactionOptions
  ): Promise<string>;
  getData(key: string, options?: TransactionOptions): Promise<string>;
  version(options?: TransactionOptions): Promise<BigNumber>;
  getParty(role: string, options?: TransactionOptions): Promise<string>;
  canCallFunction(
    stateId: string,
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<boolean>;
  PERMISSION_CHECKER_NODE(options?: TransactionOptions): Promise<string>;
  currentStateId(options?: TransactionOptions): Promise<string>;
  nonce(options?: TransactionOptions): Promise<BigNumber>;
  contractEmitterName(options?: TransactionOptions): Promise<string>;
  setData(
    v: number,
    r: string,
    s: string,
    key: string,
    value: string,
    options?: TransactionOptions
  ): Promise<void>;

  getCurrentStateId(options?: TransactionOptions): Promise<string>;
  getApplicant(options?: TransactionOptions): Promise<string>;
  getBeneficiary(options?: TransactionOptions): Promise<string>;
  getIssuingBank(options?: TransactionOptions): Promise<string>;
  getAdvisingBank(options?: TransactionOptions): Promise<string>;
  getCreatorGuid(options?: TransactionOptions): Promise<string>;
  getCommercialContractDocumentHash(
    options?: TransactionOptions
  ): Promise<string>;
  getLCDraftDocumentHash(options?: TransactionOptions): Promise<string>;
  issue(
    v: number,
    r: string,
    s: string,
    mt700Hash: string,
    docReference: string,
    options?: TransactionOptions
  ): Promise<void>;
  requestReject(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issuedLCRejectByBeneficiary(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issuedLCRejectByAdvisingBank(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  advise(
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<void>;
  acknowledge(
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<void>;
  canBeAmended(options?: TransactionOptions): Promise<boolean>;
  addLCPresentation(
    lcPresentationAddress: Address,
    options?: TransactionOptions
  ): Promise<void>;
  getLCPresentations(options?: TransactionOptions): Promise<Address[]>;
}

export interface LCAmendmentInstance extends ContractInstance {
  isValidAddress(
    address: Address,
    options?: TransactionOptions
  ): Promise<[string, boolean]>;
  getVersion(options?: TransactionOptions): Promise<BigNumber>;
  partyRolesByGuid(
    unnamed9: string,
    unnamed10: number,
    options?: TransactionOptions
  ): Promise<string>;
  partyGuidByRole(
    unnamed11: string,
    options?: TransactionOptions
  ): Promise<string>;
  getData(key: string, options?: TransactionOptions): Promise<string>;
  version(options?: TransactionOptions): Promise<BigNumber>;
  getParty(role: string, options?: TransactionOptions): Promise<string>;
  canCallFunction(
    stateId: string,
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<boolean>;
  PERMISSION_CHECKER_NODE(options?: TransactionOptions): Promise<string>;
  currentStateId(options?: TransactionOptions): Promise<string>;
  nonce(options?: TransactionOptions): Promise<BigNumber>;
  contractEmitterName(options?: TransactionOptions): Promise<string>;
  setData(
    v: number,
    r: string,
    s: string,
    key: string,
    value: string,
    options?: TransactionOptions
  ): Promise<void>;

  approveIssuingBank(
    v: number,
    r: string,
    s: string,
    mt700Hash: string,
    docReference: string,
    options?: TransactionOptions
  ): Promise<void>;
  rejectIssuingBank(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  getCurrentStateId(options?: TransactionOptions): Promise<string>;
  getApplicant(options?: TransactionOptions): Promise<string>;
  getBeneficiary(options?: TransactionOptions): Promise<string>;
  getIssuingBank(options?: TransactionOptions): Promise<string>;
  getAdvisingBank(options?: TransactionOptions): Promise<string>;
  getCreatorGuid(options?: TransactionOptions): Promise<string>;
}

export interface LCMockInstance extends ContractInstance {
  isValidAddress(
    address: Address,
    options?: TransactionOptions
  ): Promise<[string, boolean]>;
  getVersion(options?: TransactionOptions): Promise<BigNumber>;
  partyRolesByGuid(
    unnamed12: string,
    unnamed13: number,
    options?: TransactionOptions
  ): Promise<string>;
  partyGuidByRole(
    unnamed14: string,
    options?: TransactionOptions
  ): Promise<string>;
  getData(key: string, options?: TransactionOptions): Promise<string>;
  version(options?: TransactionOptions): Promise<BigNumber>;
  getParty(role: string, options?: TransactionOptions): Promise<string>;
  canCallFunction(
    stateId: string,
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<boolean>;
  PERMISSION_CHECKER_NODE(options?: TransactionOptions): Promise<string>;
  currentStateId(options?: TransactionOptions): Promise<string>;
  nonce(options?: TransactionOptions): Promise<BigNumber>;
  contractEmitterName(options?: TransactionOptions): Promise<string>;
  setData(
    v: number,
    r: string,
    s: string,
    key: string,
    value: string,
    options?: TransactionOptions
  ): Promise<void>;

  request(options?: TransactionOptions): Promise<void>;
  issue(options?: TransactionOptions): Promise<void>;
  requestReject(options?: TransactionOptions): Promise<void>;
  issuedLCRejectByBeneficiary(options?: TransactionOptions): Promise<void>;
  issuedLCRejectByAdvisingBank(options?: TransactionOptions): Promise<void>;
  advise(options?: TransactionOptions): Promise<void>;
  acknowledge(options?: TransactionOptions): Promise<void>;
}

export interface LCPresentationInstance extends ContractInstance {
  isValidAddress(
    address: Address,
    options?: TransactionOptions
  ): Promise<[string, boolean]>;
  getVersion(options?: TransactionOptions): Promise<BigNumber>;
  partyRolesByGuid(
    unnamed15: string,
    unnamed16: number,
    options?: TransactionOptions
  ): Promise<string>;
  partyGuidByRole(
    unnamed17: string,
    options?: TransactionOptions
  ): Promise<string>;
  getData(key: string, options?: TransactionOptions): Promise<string>;
  version(options?: TransactionOptions): Promise<BigNumber>;
  getParty(role: string, options?: TransactionOptions): Promise<string>;
  canCallFunction(
    stateId: string,
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<boolean>;
  tradeDocuments(
    unnamed18: string,
    options?: TransactionOptions
  ): Promise<string>;
  PERMISSION_CHECKER_NODE(options?: TransactionOptions): Promise<string>;
  currentStateId(options?: TransactionOptions): Promise<string>;
  tradeDocumentExist(
    unnamed19: string,
    options?: TransactionOptions
  ): Promise<boolean>;
  nonce(options?: TransactionOptions): Promise<BigNumber>;
  contractEmitterName(options?: TransactionOptions): Promise<string>;
  setData(
    v: number,
    r: string,
    s: string,
    key: string,
    value: string,
    options?: TransactionOptions
  ): Promise<void>;

  getCurrentStateId(options?: TransactionOptions): Promise<string>;
  getApplicant(options?: TransactionOptions): Promise<string>;
  getBeneficiary(options?: TransactionOptions): Promise<string>;
  getIssuingBank(options?: TransactionOptions): Promise<string>;
  getNominatedBank(options?: TransactionOptions): Promise<string>;
  getCreatorGuid(options?: TransactionOptions): Promise<string>;
  getDocumentBy(
    documentKey: string,
    options?: TransactionOptions
  ): Promise<string>;
  nominatedBankSetDocumentsCompliant(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  nominatedBankSetDocumentsDiscrepant(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issuingBankSetDocumentsCompliant(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issuingBankSetDocumentsDiscrepant(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  nominatedBankAdviseDiscrepancies(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issungBankAdviseDiscrepancies(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issuingBankSetDiscrepanciesAccepted(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issuingBankSetDiscrepanciesRejected(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  applicantSetDiscrepanciesAccepted(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  applicantSetDiscrepanciesRejected(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
}

export interface LCPresentationMockInstance extends ContractInstance {
  isValidAddress(
    address: Address,
    options?: TransactionOptions
  ): Promise<[string, boolean]>;
  getVersion(options?: TransactionOptions): Promise<BigNumber>;
  partyRolesByGuid(
    unnamed20: string,
    unnamed21: number,
    options?: TransactionOptions
  ): Promise<string>;
  partyGuidByRole(
    unnamed22: string,
    options?: TransactionOptions
  ): Promise<string>;
  getData(key: string, options?: TransactionOptions): Promise<string>;
  version(options?: TransactionOptions): Promise<BigNumber>;
  getParty(role: string, options?: TransactionOptions): Promise<string>;
  canCallFunction(
    stateId: string,
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<boolean>;
  tradeDocuments(
    unnamed23: string,
    options?: TransactionOptions
  ): Promise<string>;
  PERMISSION_CHECKER_NODE(options?: TransactionOptions): Promise<string>;
  currentStateId(options?: TransactionOptions): Promise<string>;
  nonce(options?: TransactionOptions): Promise<BigNumber>;
  contractEmitterName(options?: TransactionOptions): Promise<string>;
  setData(
    v: number,
    r: string,
    s: string,
    key: string,
    value: string,
    options?: TransactionOptions
  ): Promise<void>;

  nominatedBankSetDocumentsAs(
    compliant: boolean,
    options?: TransactionOptions
  ): Promise<void>;
  issuingBankSetDocumentsAs(
    compliant: boolean,
    options?: TransactionOptions
  ): Promise<void>;
}

export interface MigrationsInstance extends ContractInstance {
  last_completed_migration(options?: TransactionOptions): Promise<BigNumber>;
  owner(options?: TransactionOptions): Promise<Address>;

  setCompleted(completed: number, options?: TransactionOptions): Promise<void>;
  upgrade(new_address: Address, options?: TransactionOptions): Promise<void>;
}

export interface OwnableInstance extends ContractInstance {
  owner(options?: TransactionOptions): Promise<Address>;

  transferOwnership(
    newOwner: Address,
    options?: TransactionOptions
  ): Promise<void>;
}

export interface PermissionCheckerInstance extends ContractInstance {
  ADDR_REVERSE_NODE(options?: TransactionOptions): Promise<string>;

  isValidAddress(
    address: number,
    options?: TransactionOptions
  ): Promise<[string, boolean]>;
  findCompanyNodeFromAddress(
    address: Address,
    options?: TransactionOptions
  ): Promise<string>;
}

export interface PermissionCheckerMockInstance extends ContractInstance {
  findCompanyNodeFromAddress(
    address: Address,
    options?: TransactionOptions
  ): Promise<string>;
  ADDR_REVERSE_NODE(options?: TransactionOptions): Promise<string>;
  isValidAddress(
    address: number,
    options?: TransactionOptions
  ): Promise<[string, boolean]>;

  findCompanyNodeFromAddressHelper(
    address: Address,
    options?: TransactionOptions
  ): Promise<string>;
}

export interface ProxiableInstance extends ContractInstance {
  proxiableUUID(options?: TransactionOptions): Promise<string>;
}

export interface PublicResolverInstance extends ContractInstance {
  setAddr(
    node: string,
    addr: Address,
    options?: TransactionOptions
  ): Promise<[string, boolean]>;
}

export interface ProxiableInstance extends ContractInstance {
  proxiableUUID(options?: TransactionOptions): Promise<string>;
}

export interface SBLCInstance extends ContractInstance {
  isValidAddress(
    address: Address,
    options?: TransactionOptions
  ): Promise<[string, boolean]>;
  getVersion(options?: TransactionOptions): Promise<BigNumber>;
  partyRolesByGuid(
    unnamed24: string,
    unnamed25: number,
    options?: TransactionOptions
  ): Promise<string>;
  partyGuidByRole(
    unnamed26: string,
    options?: TransactionOptions
  ): Promise<string>;
  getData(key: string, options?: TransactionOptions): Promise<string>;
  version(options?: TransactionOptions): Promise<BigNumber>;
  getParty(role: string, options?: TransactionOptions): Promise<string>;
  canCallFunction(
    stateId: string,
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<boolean>;
  PERMISSION_CHECKER_NODE(options?: TransactionOptions): Promise<string>;
  currentStateId(options?: TransactionOptions): Promise<string>;
  nonce(options?: TransactionOptions): Promise<BigNumber>;
  contractEmitterName(options?: TransactionOptions): Promise<string>;
  setData(
    v: number,
    r: string,
    s: string,
    key: string,
    value: string,
    options?: TransactionOptions
  ): Promise<void>;

  getCurrentStateId(options?: TransactionOptions): Promise<string>;
  getApplicant(options?: TransactionOptions): Promise<string>;
  getBeneficiary(options?: TransactionOptions): Promise<string>;
  getIssuingBank(options?: TransactionOptions): Promise<string>;
  getAdvisingBank(options?: TransactionOptions): Promise<string>;
  getCreatorGuid(options?: TransactionOptions): Promise<string>;
  getCommercialContractDocumentHash(
    options?: TransactionOptions
  ): Promise<string>;
  getSBLCDraftDocumentHash(options?: TransactionOptions): Promise<string>;
  issue(
    v: number,
    r: string,
    s: string,
    mt700Hash: string,
    docReference: string,
    issuingBankPostalAddress: string,
    options?: TransactionOptions
  ): Promise<void>;
  setABI(
    node: string,
    contentType: number,
    data: string,
    options?: TransactionOptions
  ): Promise<void>;
  issuedSBLCRejectByBeneficiary(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issuedSBLCRejectByAdvisingBank(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  advise(
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<string>;
  pubkey(node: string, options?: TransactionOptions): Promise<[string, string]>;
  ABI(
    node: string,
    contentTypes: number,
    options?: TransactionOptions
  ): Promise<void>;
}

export interface SBLCInstance extends ContractInstance {
  getVersion(options?: TransactionOptions): Promise<BigNumber>;
  partyRolesByGuid(
    unnamed24: string,
    unnamed25: number,
    options?: TransactionOptions
  ): Promise<string>;
  partyGuidByRole(
    unnamed26: string,
    options?: TransactionOptions
  ): Promise<string>;
  getData(key: string, options?: TransactionOptions): Promise<string>;
  version(options?: TransactionOptions): Promise<BigNumber>;
  getParty(role: string, options?: TransactionOptions): Promise<string>;
  ADDR_REVERSE_NODE(options?: TransactionOptions): Promise<string>;
  canCallFunction(
    stateId: string,
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<boolean>;
  currentStateId(options?: TransactionOptions): Promise<string>;
  nonce(options?: TransactionOptions): Promise<BigNumber>;
  contractEmitterName(options?: TransactionOptions): Promise<string>;
  setData(
    v: number,
    r: string,
    s: string,
    key: string,
    value: string,
    options?: TransactionOptions
  ): Promise<void>;

  getCurrentStateId(options?: TransactionOptions): Promise<string>;
  getApplicant(options?: TransactionOptions): Promise<string>;
  getBeneficiary(options?: TransactionOptions): Promise<string>;
  getIssuingBank(options?: TransactionOptions): Promise<string>;
  getAdvisingBank(options?: TransactionOptions): Promise<string>;
  getCreatorGuid(options?: TransactionOptions): Promise<string>;
  getCommercialContractDocumentHash(
    options?: TransactionOptions
  ): Promise<string>;
  getSBLCDraftDocumentHash(options?: TransactionOptions): Promise<string>;
  issue(
    v: number,
    r: string,
    s: string,
    mt700Hash: string,
    docReference: string,
    issuingBankPostalAddress: string,
    options?: TransactionOptions
  ): Promise<void>;
  requestReject(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issuedSBLCRejectByBeneficiary(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  issuedSBLCRejectByAdvisingBank(
    v: number,
    r: string,
    s: string,
    comments: string,
    options?: TransactionOptions
  ): Promise<void>;
  advise(
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<void>;
  acknowledge(
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<void>;
}

export interface Sha3AddressLibInstance extends ContractInstance {
  sha3HexAddress(addr: Address, options?: TransactionOptions): Promise<string>;
}

export interface SignatureVerifierInstance extends ContractInstance {
  nonce(options?: TransactionOptions): Promise<BigNumber>;
  contractEmitterName(options?: TransactionOptions): Promise<string>;
}

export interface SignatureVerifierMockInstance extends ContractInstance {
  value(options?: TransactionOptions): Promise<BigNumber>;
  nonce(options?: TransactionOptions): Promise<BigNumber>;
  contractEmitterName(options?: TransactionOptions): Promise<string>;

  recoverAddrFromStringHelper(
    msg: string,
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<Address>;
  recoverAddrHelper(
    msgHash: string,
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<Address>;
  isSignedHelper(
    addr: Address,
    msgHash: string,
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<boolean>;
  recoverSignerFromSignedDataHelper(
    dataHash: string,
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<Address>;
  recoverSignerFromSignedCallDataHelper(
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<Address>;
  incrementNonceHelper(options?: TransactionOptions): Promise<void>;
  mockFunction(
    v: number,
    r: string,
    s: string,
    options?: TransactionOptions
  ): Promise<void>;
  mockFunctionWithInputs(
    v: number,
    r: string,
    s: string,
    a: number,
    options?: TransactionOptions
  ): Promise<void>;
}

export interface SimpleStorageInstance extends ContractInstance {
  value(options?: TransactionOptions): Promise<BigNumber>;
}

export interface VersionableInstance extends ContractInstance {
  version(options?: TransactionOptions): Promise<BigNumber>;
  getVersion(options?: TransactionOptions): Promise<BigNumber>;
}
