import 'jest'

import ContentionManager from './ContentionManager'

const sleep = (miliseconds: number) => new Promise(resolve => setTimeout(resolve, miliseconds))
const roundRelativeTime = (time: number) => Math.round(time / 1000) * 1000
const range = (n: number) => Array(n).keys()
const prepareTasks = (contentionManager: ContentionManager) => {
  const numberOfTasks = 5
  const promises = []
  for (const i of range(numberOfTasks)) {
    const contentionTask = contentionManager.apply(
      async () =>
        new Promise<{}>(async resolve => {
          const taskStart = new Date().getTime()
          // simulate some work
          // add a small interval per request so contentionManager.getWaitingTasks()
          // can see previous tasks releasing semaphore
          await sleep(1000 + i)

          const waitingInSemaphore = contentionManager.getWaitingTasks()

          resolve({
            id: i,
            taskStart,
            taskEnd: new Date().getTime(),
            waitingInSemaphore
          })
        })
    )

    promises.push(contentionTask)
  }
  return promises
}

const genericTest = async (data: {
  concurrency: number
  waitingInSemaphoreThroughTime: number[]
  taskSequenceThroughTime: number[]
  taskFinishTimeIntervals: number[]
  taskStartingTimes: number[]
}) => {
  // create a new instance for testing
  const contentionManager = new ContentionManager(data.concurrency)

  // prepare all necessary tasks to exercise contention manager
  const tasks = prepareTasks(contentionManager)

  // resolve all task concurrently
  const startTime = new Date().getTime()
  const results = await Promise.all(tasks)

  // analyse semaphore queue through time.
  // example:
  // if mutex, expect to see [ 4, 3, 2, 1, 0 ] which means:
  // - before first task was executed, 4 tasks are waiting in semaphore
  // - before second task was executed, 3 tasks are waiting in semaphore
  // - before last task was executed, no tasks are wating in semaphore
  const waitingThroughTime = results.filter(r => r.waitingInSemaphore !== undefined).map(r => r.waitingInSemaphore)
  expect(waitingThroughTime).toEqual(data.waitingInSemaphoreThroughTime)

  // analyse task sequence number through time
  // we expect to see all tasks executed in sequence [0,1,2,3,4].
  const sequenceThroughTime = results.filter(r => r.id !== undefined).map(r => r.id)
  expect(sequenceThroughTime).toEqual(data.taskSequenceThroughTime)

  // analyse relative time that each task started / waited in semaphore.
  // example:
  // - in mutex expect to see tasks being handled one-by-one as [0, 100, 200, 300, 400], which means the first task did not wait in semaphore and the remaining tasks will start as the last one finishes
  // - in semaphore(3) expect to see [0, 0, 0, 100, 100] as the first three tasks start being executing since the beginning and, once they are free, the remaining 2 tasks are executed (waiting only 100ms)
  const startTimeThroughTime = results
    .filter(r => r.taskStart !== undefined)
    .map(r => roundRelativeTime(r.taskStart - startTime))
  expect(startTimeThroughTime).toEqual(data.taskStartingTimes)

  // analyse relative time that each task finishes.
  // example:
  // - in mutex expect to see tasks being handled one-by-one so they should end as [100, 200, 300, 400, 500]
  // - in semaphore(3) expect to see [100, 100, 100, 200, 200]
  //   this means the the first 3 tasks completed at the same time and freeing 3 slots
  //   the remaining 2 tasks will be executed afterwards and complete at the same time (200ms)
  const timestampThroughTime = results
    .filter(r => r.taskEnd !== undefined)
    .map(r => roundRelativeTime(r.taskEnd - startTime))
  expect(timestampThroughTime).toEqual(data.taskFinishTimeIntervals)
}

describe('ContentionManager', () => {
  beforeAll(() => {
    jest.setTimeout(10000) // 10 second timeout
  })

  it('concurrency 1 - should behave like a mutex', async () => {
    await genericTest({
      concurrency: 1,
      waitingInSemaphoreThroughTime: [4, 3, 2, 1, 0],
      taskSequenceThroughTime: [0, 1, 2, 3, 4],
      taskFinishTimeIntervals: [1000, 2000, 3000, 4000, 5000],
      taskStartingTimes: [0, 1000, 2000, 3000, 4000]
    })
  })

  it('concurrency 3 - perform some contention', async () => {
    await genericTest({
      concurrency: 3,
      waitingInSemaphoreThroughTime: [2, 1, 0, 0, 0],
      taskSequenceThroughTime: [0, 1, 2, 3, 4],
      taskFinishTimeIntervals: [1000, 1000, 1000, 2000, 2000],
      taskStartingTimes: [0, 0, 0, 1000, 1000]
    })
  })

  it('concurrency 5 - no contention applied', async () => {
    await genericTest({
      concurrency: 5,
      waitingInSemaphoreThroughTime: [0, 0, 0, 0, 0],
      taskSequenceThroughTime: [0, 1, 2, 3, 4],
      taskFinishTimeIntervals: [1000, 1000, 1000, 1000, 1000],
      taskStartingTimes: [0, 0, 0, 0, 0]
    })
  })

  it('should throw error if task waited too long in ContentionManager', async () => {
    const contentionManager = new ContentionManager(1)
    const taskDuration = 1000
    const timeoutInSemaphore = 1
    const bigTask = contentionManager.apply(async () => sleep(taskDuration))
    const taskToTimeout = contentionManager.apply(async () => sleep(taskDuration), timeoutInSemaphore)

    await expect(Promise.all([bigTask, taskToTimeout])).rejects.toThrow('Waited too long in contention manager')
  })
})
