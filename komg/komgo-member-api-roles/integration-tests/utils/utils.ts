import Axios from 'axios'

export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function waitUntilServerIsUp(baseURL: string): Promise<void> {
  for (let i = 0; i < 10; i++) {
    try {
      const { data } = await Axios.get(`${baseURL}/ready`)
      if (data.mongo === 'OK') {
        return
      }
    } catch (error) {
      await sleep(2000)
    }
  }

  throw new Error(`Server wait timeout. URL: ${baseURL}/ready`)
}
