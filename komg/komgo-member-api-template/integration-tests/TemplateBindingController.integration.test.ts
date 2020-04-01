import { IntegrationEnvironment } from "./utils/IntegrationEnvironment";
import Axios from 'axios'
import { buildFakeTemplateBinding, buildFakeTemplateBindingBase } from "@komgo/types";
import { TemplateBindingRepo } from "../src/data-layer/mongodb/TemplateBindingRepo";
jest.setTimeout(50000)

export const MOCK_ENCODED_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

describe('TemplateBindingController integration test', () => {

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
    await iEnv.cleanCollection(TemplateBindingRepo.collection)
  })

  it('Get template bindings', async() => {
    const binding = buildFakeTemplateBindingBase()
    const response1 = await axiosInstance.post(`/templatebindings`, binding)
    const createdBinding = response1.data
    const response2 = await axiosInstance.get(`/templatebindings`)
    const bindings = response2.data
    
    const receivedBinding = bindings.items[0]
    expect(bindings.total).toEqual(1)
    expect(receivedBinding).toMatchObject(createdBinding)
  })

  it('Get template bindings empty', async() => {
    const response2 = await axiosInstance.get(`/templatebindings`)
    const bindings = response2.data
    expect(bindings.total).toEqual(0)
  })
})
