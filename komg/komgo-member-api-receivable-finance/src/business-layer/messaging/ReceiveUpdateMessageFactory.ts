import { IReceivablesDiscounting, IQuote, ITradeSnapshot } from '@komgo/types'
import { inject, injectable } from 'inversify'

import { TYPES } from '../../inversify'
import { ReceiveFinalAgreedTermsUpdateUseCase } from '../quotes/use-cases'
import { ReceiveRDUpdateUseCase } from '../rd/use-cases'
import { ReceiveTradeSnapshotUpdateUseCase } from '../trade-snapshot/use-cases'
import { UpdateType, IReceiveUpdateUseCase } from '../types'

type Editable = IReceivablesDiscounting | IQuote | ITradeSnapshot

@injectable()
export class ReceiveUpdateMessageFactory {
  private readonly useCases: Record<UpdateType, IReceiveUpdateUseCase<Editable>>

  constructor(
    @inject(TYPES.ReceiveRDUpdateUseCase) private readonly receiveRDUpdateUseCase: ReceiveRDUpdateUseCase,
    @inject(TYPES.ReceiveFinalAgreedTermsUpdateUseCase)
    private readonly receiveQuoteUpdateUseCase: ReceiveFinalAgreedTermsUpdateUseCase,
    @inject(TYPES.ReceiveTradeSnapshotUpdateUseCase)
    private readonly receiveTradeSnapshotUpdateUseCase: ReceiveTradeSnapshotUpdateUseCase
  ) {
    this.useCases = {
      [UpdateType.ReceivablesDiscounting]: this.receiveRDUpdateUseCase,
      [UpdateType.FinalAgreedTermsData]: this.receiveQuoteUpdateUseCase,
      [UpdateType.TradeSnapshot]: this.receiveTradeSnapshotUpdateUseCase
    }
  }

  public getUseCase(updateMessageType: UpdateType): IReceiveUpdateUseCase<any> {
    return this.useCases[updateMessageType]
  }
}
