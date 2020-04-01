import { model, Error as MError } from 'mongoose'
import 'reflect-metadata'

import { default as TaskSchema, requiredPermissionValidation } from './TaskSchema'
import { permissionsByProductAndAction } from '@komgo/permissions'

describe('TaskSchema', () => {
  it('should show errors on empty context', async () => {
    const Task = model('Task', TaskSchema)
    const task = new Task({
      summary: 'summary',
      taskType: 'SBLC.ReviewIssued',
      status: 'To Do',
      requiredPermission: { productId: 'administration', actionId: 'manageUsers' },
      context: {}
    })
    try {
      await task.validate()
    } catch (e) {
      expect(e).toEqual(Error('Task validation failed: context: context can not be empty'))
    }
  })
  it('should show errors on invalid permissions', async () => {
    const Task = model('Task', TaskSchema)
    const task = new Task({
      summary: 'summary',
      taskType: 'SBLC.ReviewIssued',
      status: 'To Do',
      requiredPermission: { productId: 'invalid_1', actionId: 'invalid_2' },
      context: { ok: 1 }
    })
    try {
      await task.validate()
    } catch (e) {
      const err = new MError.ValidationError()

      err.message = `Task validation failed: requiredPermission: Value can be one of the following ${JSON.stringify(
        Object.keys(permissionsByProductAndAction)
      )}`
      expect(e).toEqual(err)
    }
  })
  it('should pass on correct data', async () => {
    const Task = model('Task', TaskSchema)
    const task = new Task({
      summary: 'summary',
      taskType: 'SBLC.ReviewIssued',
      status: 'To Do',
      requiredPermission: { productId: 'administration', actionId: 'manageUsers' },
      context: { ok: 1 }
    })
    await expect(task.validate()).resolves.toBeUndefined()
  })
  it('should pass permission validation on correct pair', () => {
    expect(requiredPermissionValidation({ productId: 'administration', actionId: 'manageUsers' })).toBeTruthy()
  })
  it('should fail permission validation on incorrect pair', () => {
    expect(requiredPermissionValidation({ productId: 'administration1', actionId: 'manageUsers' })).toBeFalsy()
  })
  it('should fail permission validation on undefined product', () => {
    expect(requiredPermissionValidation({ productId: undefined, actionId: 'manageUsers' })).toBeFalsy()
  })
  it('should fail permission validation on undefined action', () => {
    expect(requiredPermissionValidation({ productId: 'administration', actionId: undefined })).toBeFalsy()
  })
})
