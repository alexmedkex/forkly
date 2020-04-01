import { IDataLetterOfCredit, ILetterOfCredit } from '@komgo/types'
import { findRole } from './findRole'
import { findTasksByLetterOfCreditStaticId } from './taskUtil'
import { TaskStatus, Task } from '../../tasks/store/types'
import { findLatestShipment } from './findLatestShipment'
import { ILetterOfCreditEnriched } from '../store/types'

export const buildLetterOfCreditEnriched = (
  letter: ILetterOfCredit<IDataLetterOfCredit>,
  tasks: Task[],
  companyStaticId: string
) => {
  const role = findRole(letter, companyStaticId)
  const letterTasks = findTasksByLetterOfCreditStaticId(tasks, letter.staticId)
  const enriched: ILetterOfCreditEnriched = {
    ...letter,
    role,
    actionStatus: letterTasks.length ? TaskStatus.ToDo : TaskStatus.Done,
    latestShipment: findLatestShipment(letter),
    tasks: letterTasks
  }
  return enriched
}
