import { SPACES } from '@komgo/ui-components'
import { Spacer } from '../../../components/spacer/Spacer'
import React, { ReactNode } from 'react'

export const TopHeader = ({ children }: { children: ReactNode }) => (
  <Spacer
    paddingTop={SPACES.SMALL}
    paddingBottom={SPACES.DEFAULT}
    paddingLeft={SPACES.DEFAULT}
    paddingRight={SPACES.DEFAULT}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>{children}</div>
  </Spacer>
)
