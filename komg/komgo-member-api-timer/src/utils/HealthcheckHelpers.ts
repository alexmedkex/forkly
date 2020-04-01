enum MSNames {
  ApiAuth = 'api-auth',
  ApiBlockchainSigner = 'api-blockchain-signer',
  ApiCoverage = 'api-coverage',
  ApiDocuments = 'api-documents',
  ApiNotif = 'api-notif',
  ApiRegistry = 'api-registry',
  ApiRoles = 'api-roles',
  ApiSigner = 'api-signer',
  ApiUsers = 'api-users',
  WsServer = 'ws-server',
  EventManagement = 'event-management',
  BlockchainEventManagement = 'blockchain-event-management'
}

enum KomgoOnlyNames {
  ApiMagicLink = 'api-magic-link',
  ApiOnbording = 'api-onboarding',
  ApiProducts = 'api-products'
}

enum MemberOnlyNames {
  ApiCreditLines = 'api-credit-lines',
  ApiReceivableFinance = 'api-receivable-finance',
  ApiRfp = 'api-rfp',
  ApiTradeCargo = 'api-trade-cargo',
  ApiTradeFinance = 'api-trade-finance'
}

type IServices = { [key in MSNames]: string }
type IKomgoOnlyServices = { [key in KomgoOnlyNames]: string }

type IMemberOnlyServices = { [key in MemberOnlyNames]: string }

const {
  API_AUTH_BASE_URL,
  API_BLOCKCHAIN_SIGNER_BASE_URL,
  API_COVERAGE_BASE_URL,
  API_CREDIT_LINES_BASE_URL,
  API_DOCUMENTS_BASE_URL,
  API_MAGIC_LINK_BASE_URL,
  API_NOTIF_BASE_URL,
  API_ONBOARDING_BASE_URL,
  API_PRODUCTS_BASE_URL,
  API_RECEIVABLE_FINANCE_BASE_URL,
  API_REGISTRY_BASE_URL,
  API_RFP_BASE_URL,
  API_ROLES_BASE_URL,
  API_TRADE_CARGO_BASE_URL,
  API_TRADE_FINANCE_BASE_URL,
  API_SIGNER_BASE_URL,
  API_USERS_BASE_URL,
  BLOCKCHAIN_EVENT_MANAGEMENT_BASE_URL,
  EVENT_MANAGEMENT_BASE_URL,
  WS_SERVER_BASE_URL
} = process.env

export const serviceURLs: IServices = {
  [MSNames.ApiAuth]: `${API_AUTH_BASE_URL}/ready`,
  [MSNames.ApiBlockchainSigner]: `${API_BLOCKCHAIN_SIGNER_BASE_URL}/v0/ready`,
  [MSNames.ApiCoverage]: `${API_COVERAGE_BASE_URL}/v0/ready`,
  [MSNames.ApiDocuments]: `${API_DOCUMENTS_BASE_URL}/v0/ready`,
  [MSNames.ApiNotif]: `${API_NOTIF_BASE_URL}/v0/ready`,
  [MSNames.ApiRegistry]: `${API_REGISTRY_BASE_URL}/v0/ready`,
  [MSNames.ApiRoles]: `${API_ROLES_BASE_URL}/v0/ready`,
  [MSNames.ApiSigner]: `${API_SIGNER_BASE_URL}/v0/ready`,
  [MSNames.ApiUsers]: `${API_USERS_BASE_URL}/v0/ready`,
  [MSNames.EventManagement]: `${EVENT_MANAGEMENT_BASE_URL}/v0/ready`,
  [MSNames.BlockchainEventManagement]: `${BLOCKCHAIN_EVENT_MANAGEMENT_BASE_URL}/v0/ready`,
  [MSNames.WsServer]: `${WS_SERVER_BASE_URL}/ready`
}

export const memberOnlyServices: IMemberOnlyServices = {
  [MemberOnlyNames.ApiCreditLines]: `${API_CREDIT_LINES_BASE_URL}/v0/ready`,
  [MemberOnlyNames.ApiReceivableFinance]: `${API_RECEIVABLE_FINANCE_BASE_URL}/v0/ready`,
  [MemberOnlyNames.ApiRfp]: `${API_RFP_BASE_URL}/v0/ready`,
  [MemberOnlyNames.ApiTradeCargo]: `${API_TRADE_CARGO_BASE_URL}/v0/ready`,
  [MemberOnlyNames.ApiTradeFinance]: `${API_TRADE_FINANCE_BASE_URL}/v0/ready`
}

export const komgoOnlyServices: IKomgoOnlyServices = {
  [KomgoOnlyNames.ApiMagicLink]: `${API_MAGIC_LINK_BASE_URL}/v0/ready`,
  [KomgoOnlyNames.ApiProducts]: `${API_PRODUCTS_BASE_URL}/v0/ready`,
  [KomgoOnlyNames.ApiOnbording]: `${API_ONBOARDING_BASE_URL}/v0/ready`
}

export const getAllServiceURLs = (isKomgoNode: string) => {
  return isKomgoNode && isKomgoNode.toString().toLowerCase() === 'true'
    ? { ...serviceURLs, ...komgoOnlyServices }
    : { ...serviceURLs, ...memberOnlyServices }
}

export const getVerifStatus = (status: number) => {
  return status >= 200
}
