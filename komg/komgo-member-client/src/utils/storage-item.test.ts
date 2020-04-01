import { LocalStorageItem } from './storage-item'

const storageField = 'testField'

xdescribe('LocalStorageItem', () => {
  const setItemSpy: any = jest.spyOn(Storage.prototype, 'setItem')
  const getItemSpy: any = jest.spyOn(Storage.prototype, 'getItem')
  const removeItemSpy: any = jest.spyOn(Storage.prototype, 'removeItem')

  beforeEach(() => {
    setItemSpy.mockReset()
    getItemSpy.mockReset()
    removeItemSpy.mockReset()
    jest.resetAllMocks()
  })

  it('should set localStorageSupported to true', () => {
    const worker = new LocalStorageItem(storageField)

    expect(worker.localStorageSupported).toEqual(true)
  })

  it('should set storageKey to selected argument', () => {
    const worker = new LocalStorageItem('newField')

    expect(worker.storageKey).toEqual('newField')
  })

  it('should add field to localStorage', () => {
    const worker = new LocalStorageItem(storageField)

    worker.add('someData')

    expect(setItemSpy).toHaveBeenCalledWith(storageField, 'someData')
  })

  it('should not add field to localStorage', () => {
    const worker = new LocalStorageItem(storageField)
    worker.localStorageSupported = false

    worker.add('someData')

    expect(setItemSpy).not.toHaveBeenCalled()
  })

  it('should get data from localStorage', () => {
    const worker = new LocalStorageItem(storageField)

    worker.get()

    expect(getItemSpy).toHaveBeenCalledWith(storageField)
  })

  it('should not get data from localStorage', () => {
    const worker = new LocalStorageItem(storageField)
    worker.localStorageSupported = false

    worker.get()

    expect(getItemSpy).not.toHaveBeenCalled()
  })

  it('should remove field from localStorage', () => {
    const worker = new LocalStorageItem(storageField)

    worker.remove()

    expect(removeItemSpy).toHaveBeenCalledWith(storageField)
  })

  it('should not remove field from localStorage', () => {
    const worker = new LocalStorageItem(storageField)
    worker.localStorageSupported = false

    worker.remove()

    expect(removeItemSpy).not.toHaveBeenCalled()
  })
})
