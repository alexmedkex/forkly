import * as React from 'react'
import { ReactComponent as Doc } from './doc.svg'
import { ReactComponent as Pdf } from './pdf.svg'
import { ReactComponent as Jpg } from './jpg.svg'
import { ReactComponent as Png } from './png.svg'
import { ReactComponent as File } from './file.svg'
import { ReactComponent as Xls } from './xls.svg'
import { ReactComponent as Error } from './error.svg'
import { ReactComponent as Success } from './success.svg'

const typeMap = {
  doc: (props?: any) => <Doc {...props} />,
  pdf: (props?: any) => <Pdf {...props} />,
  jpg: (props?: any) => <Jpg {...props} />,
  jpeg: (props?: any) => <Jpg {...props} />,
  png: (props?: any) => <Png {...props} />,
  file: (props?: any) => <File {...props} />,
  xls: (props?: any) => <Xls {...props} />
}

const RegisteredStatus = {
  error: (props: any) => <Error {...props} />,
  success: (props: any) => <Success {...props} />
}

export { typeMap, RegisteredStatus }
