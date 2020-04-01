import { buildFakeTemplateBase, ITemplate, ITemplateBase, TemplateOrigin } from '@komgo/types'
import Axios from 'axios'
import { compressToBase64 } from 'lz-string'
import { stringify, parse } from 'qs'
import waitForExpect from 'wait-for-expect'

import { TemplateRepo } from '../src/data-layer/mongodb/TemplateRepo'

import { IntegrationEnvironment } from './utils/IntegrationEnvironment'
jest.setTimeout(50000)

export const MOCK_ENCODED_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
const JWT_NAME = 'John Doe'

describe('TemplateController integration test', () => {
  let iEnv: IntegrationEnvironment

  const axiosInstance = Axios.create({
    baseURL: 'http://localhost:8080/v0',
    headers: { Authorization: `Bearer ${MOCK_ENCODED_JWT}` }
  })

  beforeAll(async () => {
    iEnv = new IntegrationEnvironment()
    await iEnv.setup()
    await iEnv.start()
  })

  afterAll(async () => {
    await iEnv.afterAll()
  })

  afterEach(async () => {
    await iEnv.cleanCollection(TemplateRepo.collection)
  })

  it('Create valid template', async () => {
    const baseTemplate1 = buildFakeTemplateBase()
    const baseTemplate2 = buildFakeTemplateBase()
    const response1 = await axiosInstance.post('/templates', baseTemplate1)
    const response2 = await axiosInstance.post('/templates', baseTemplate2)
    const createdTemplate1: ITemplate = response1.data
    const createdTemplate2: ITemplate = response2.data
    await assertTemplateInDB(createdTemplate1.staticId, baseTemplate1)
    await assertTemplateInDB(createdTemplate2.staticId, baseTemplate2)
  })

  it('Update valid template', async () => {
    const baseTemplate = buildFakeTemplateBase()
    const response = await axiosInstance.post('/templates', baseTemplate)
    const createdTemplate = response.data

    baseTemplate.name = 'updatedName'
    await axiosInstance.put(`/templates/${createdTemplate.staticId}`, baseTemplate)

    await assertTemplateInDB(createdTemplate.staticId, baseTemplate, true)
  })

  it('Update deleted template should 404', async () => {
    const baseTemplate = buildFakeTemplateBase()
    const response = await axiosInstance.post('/templates', baseTemplate)
    const createdTemplate = response.data
    await axiosInstance.delete(`/templates/${createdTemplate.staticId}`)
    try {
      await axiosInstance.put(`/templates/${createdTemplate.staticId}`, baseTemplate)
      fail('should not reach this point')
    } catch (error) {
      expect(error.response.status).toBe(404)
    }
    await assertTemplateInDB(createdTemplate.staticId, baseTemplate)
  })

  it('Delete valid template', async () => {
    const baseTemplate = buildFakeTemplateBase()
    const response = await axiosInstance.post('/templates', baseTemplate)
    const createdTemplate = response.data
    await axiosInstance.delete(`/templates/${createdTemplate.staticId}`)
    expect(createdTemplate.deletedAt).toBeUndefined()
    await assertTemplateInDB(createdTemplate.staticId, { ...baseTemplate, deletedAt: expect.anything() })
  })

  it('Delete a removed template should return 404', async () => {
    const baseTemplate = buildFakeTemplateBase()
    const response = await axiosInstance.post('/templates', baseTemplate)
    const createdTemplate = response.data
    await axiosInstance.delete(`/templates/${createdTemplate.staticId}`)
    try {
      await axiosInstance.delete(`/templates/${createdTemplate.staticId}`)
      fail('should not reach this point')
    } catch (error) {
      expect(error.response.status).toBe(404)
    }
  })

  it('Delete template does not exists must return 404', async () => {
    const baseTemplate = buildFakeTemplateBase()
    await axiosInstance.post('/templates', baseTemplate)
    try {
      await axiosInstance.delete(`/templates/invalidId`)
      fail('should not reach this point')
    } catch (error) {
      expect(error.response.status).toBe(404)
    }
  })

  it('Update invalid template should fail', async () => {
    const baseTemplate = buildFakeTemplateBase()
    const response = await axiosInstance.post('/templates', baseTemplate)
    const createdTemplate = response.data
    baseTemplate.templateBindingStaticId = 'notuuid'
    try {
      await axiosInstance.put(`/templates/${createdTemplate.staticId}`, baseTemplate)
      fail('should not reach this point')
    } catch (error) {
      const validationError = error.response.data.fields
      expect(Object.keys(validationError).includes('.templateBindingStaticId')).toBeTruthy()
      expect(error.response.status).toBe(422)
    }
  })

  it('Update not existing template should return 404', async () => {
    const baseTemplate = buildFakeTemplateBase()
    const response = await axiosInstance.post('/templates', baseTemplate)
    const createdTemplate = response.data
    baseTemplate.name = 'updatedName'
    try {
      await axiosInstance.put(`/templates/wrongstaticId`, baseTemplate)
      fail('should not reach this point')
    } catch (error) {
      expect(error.response.status).toBe(404)
    }
  })

  it('Create invalid template should fail', async () => {
    const baseTemplate: ITemplateBase = buildFakeTemplateBase()
    baseTemplate.templateBindingStaticId = 'notuuid'
    try {
      await axiosInstance.post('/templates', baseTemplate)
      fail('should not reach this point')
    } catch (error) {
      const validationError = error.response.data.fields
      console.log(error.response.data)
      expect(Object.keys(validationError).includes('.templateBindingStaticId')).toBeTruthy()
      expect(error.response.status).toBe(422)
    }
  })

  it('Get template when it exists', async () => {
    const baseTemplate = buildFakeTemplateBase()
    const response1 = await axiosInstance.post('/templates', baseTemplate)
    const createdTemplate = response1.data
    const response2 = await axiosInstance.get(`/templates/${createdTemplate.staticId}`)
    const template = response2.data
    expect(template).toMatchObject({
      ...baseTemplate,
      __v: template.__v,
      _id: template._id,
      template: template.template,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      staticId: createdTemplate.staticId,
      origin: TemplateOrigin.Company
    })
  })

  it('get template when template is deleted should return 404', async () => {
    const baseTemplate = buildFakeTemplateBase()
    const response1 = await axiosInstance.post('/templates', baseTemplate)
    const createdTemplate = response1.data
    await axiosInstance.delete(`/templates/${createdTemplate.staticId}`)
    try {
      await axiosInstance.get(`/templates/${createdTemplate.staticId}`)
      fail('should not reach this point')
    } catch (error) {
      expect(error.response.status).toBe(404)
    }
  })

  it('Get all templates, empty', async () => {
    const response = await axiosInstance.get(`/templates`)
    const templates = response.data
    expect(templates.items).toEqual([])
    expect(templates.total).toEqual(0)
  })

  it('Get all templates', async () => {
    const baseTemplate = buildFakeTemplateBase()
    const response1 = await axiosInstance.post('/templates', baseTemplate)
    const template1 = response1.data
    const staticId1 = template1.staticId
    const response2 = await axiosInstance.post('/templates', baseTemplate)
    const template2 = response2.data
    const staticId2 = template2.staticId

    const response = await axiosInstance.get(`/templates`)
    const result = response.data
    const items = result.items
    expect(items.length).toEqual(2)
    expect(result.total).toEqual(2)
    await assertTemplateInDB(staticId1, template1)
    await assertTemplateInDB(staticId2, template2)
  })

  it('Get all templates with pagination', async () => {
    const baseTemplate = buildFakeTemplateBase()
    const response1 = await axiosInstance.post('/templates', baseTemplate)
    const template1 = response1.data
    const staticId1 = template1.staticId
    const response2 = await axiosInstance.post('/templates', baseTemplate)
    const template2 = response2.data
    const staticId2 = template2.staticId
    const response3 = await axiosInstance.post('/templates', baseTemplate)
    const template3 = response3.data
    const staticId3 = template3.staticId
    const filter = compressToBase64(
      stringify({
        options: {
          skip: 1,
          limit: 1
        }
      })
    )

    const response = await axiosInstance.get(`/templates?filter=${filter}`)
    const result = response.data
    const items = result.items
    const item = items[0]
    expect(item.staticId).toEqual(staticId2)
    expect(items.length).toEqual(1)
    expect(result.total).toEqual(3)
    await assertTemplateInDB(staticId1, template1)
    await assertTemplateInDB(staticId2, template2)
    await assertTemplateInDB(staticId3, template3)
  })

  it('Get all templates with sorting', async () => {
    const baseTemplate = buildFakeTemplateBase()
    const t1 = Object.assign({}, baseTemplate)
    t1.name = 'aaaaa'
    const t2 = Object.assign({}, baseTemplate)
    t2.name = 'bbbbb'
    const t3 = Object.assign({}, baseTemplate)
    t3.name = 'ccccc'
    await axiosInstance.post('/templates', t1)
    await axiosInstance.post('/templates', t2)
    await axiosInstance.post('/templates', t3)
    const filter = compressToBase64(
      stringify({
        options: {
          skip: 0,
          limit: 10,
          sort: {
            name: '-1'
          }
        }
      })
    )

    const response = await axiosInstance.get(`/templates?filter=${filter}`)
    const result = response.data
    const items = result.items
    const item1 = items[0]
    const item2 = items[1]
    const item3 = items[2]
    expect(item1.name).toEqual('ccccc')
    expect(item2.name).toEqual('bbbbb')
    expect(item3.name).toEqual('aaaaa')
    expect(items.length).toEqual(3)
    expect(result.total).toEqual(3)
  })

  it('Get all templates that are not deleted', async () => {
    const baseTemplate = buildFakeTemplateBase()
    const response1 = await axiosInstance.post('/templates', baseTemplate)
    const template1 = response1.data
    const staticId1 = template1.staticId
    const response2 = await axiosInstance.post('/templates', baseTemplate)
    const template2 = response2.data
    const staticId2 = template2.staticId
    await axiosInstance.delete(`/templates/${staticId1}`)

    const response = await axiosInstance.get(`/templates`)
    const result = response.data
    const items = result.items
    expect(items.length).toEqual(1)
    expect(result.total).toEqual(1)
    await assertTemplateInDB(staticId2, template2)
  })

  const assertTemplateInDB = async (
    staticId: string,
    template: ITemplateBase | ITemplate,
    isUpdate?: boolean,
    origin = TemplateOrigin.Company) => {
    await waitForExpect(async () => {
      const savedTemplate: any = await TemplateRepo.findOne({ staticId: staticId })
      const expectedObject = {
        ...template,
        __v: savedTemplate.__v,
        _id: expect.anything(),
        createdAt: savedTemplate.createdAt,
        updatedAt: savedTemplate.updatedAt,
        deletedAt: savedTemplate.deletedAt,
        createdBy: JWT_NAME,
        updatedBy: undefined,
        staticId,
        origin
      }
      if(isUpdate) {
        expectedObject.updatedBy = JWT_NAME
      }
      expect(savedTemplate).toMatchObject(expectedObject)
    })
  }
})
