// "expect" is globally defined by the "jest" library
declare const expect: any

export async function expectError(status: number, message: string, promise: Promise<any>) {
  await expect(promise).rejects.toMatchObject({
    status,
    message
  })
}
