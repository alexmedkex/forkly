import { TRADE_DOCUMENTS_BASE_ENDPOINT, DOCUMENTS_BASE_ENDPOINT } from '../../../utils/endpoints'
import { ProductId } from '../store'

const getBaseEndpoint = (productId: ProductId) =>
  productId === 'tradeFinance' ? TRADE_DOCUMENTS_BASE_ENDPOINT : DOCUMENTS_BASE_ENDPOINT

export default getBaseEndpoint
