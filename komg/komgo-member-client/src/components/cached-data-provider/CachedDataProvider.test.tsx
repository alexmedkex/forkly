import React from 'react'
import { CachedDataProvider } from './CachedDataProvider'
import { mount } from 'enzyme'
import { v4 as uuid4 } from 'uuid'

describe('CachedDataProvider', () => {
  let cachedData: object
  let data: object

  beforeEach(() => {
    data = { content: 'test-content' }
  })
  it('starts off with an empty cache', () => {
    mount(
      <CachedDataProvider data={data} id={'test-id'}>
        {({ cached }) => {
          cachedData = cached
          return <></>
        }}
      </CachedDataProvider>
    )

    expect(cachedData).toEqual(null)
  })

  it('stores data across instantiations if no data provided', () => {
    let cached1
    let cached2
    let cached3
    const id = uuid4()
    mount(
      <CachedDataProvider data={data} id={id}>
        {({ cached }) => {
          cached1 = cached
          return <></>
        }}
      </CachedDataProvider>
    )
    mount(
      <CachedDataProvider data={null} id={id}>
        {({ cached }) => {
          cached2 = cached
          return <></>
        }}
      </CachedDataProvider>
    )
    mount(
      <CachedDataProvider data={null} id={id}>
        {({ cached }) => {
          cached3 = cached
          return <></>
        }}
      </CachedDataProvider>
    )

    expect(cached1).toEqual(null)
    expect(cached2).toEqual(data)
    expect(cached3).toEqual(data)
  })

  it('stores data each time it is provided', () => {
    let cached1
    let cached2
    let cached3
    const id = uuid4()
    mount(
      <CachedDataProvider data={data} id={id}>
        {({ cached }) => {
          cached1 = cached
          return <></>
        }}
      </CachedDataProvider>
    )

    const data2 = { content: 'second-test-content' }
    mount(
      <CachedDataProvider data={data2} id={id}>
        {({ cached }) => {
          cached2 = cached
          return <></>
        }}
      </CachedDataProvider>
    )

    const data3 = { content: 'third-test-content' }
    mount(
      <CachedDataProvider data={data3} id={id}>
        {({ cached }) => {
          cached3 = cached
          return <></>
        }}
      </CachedDataProvider>
    )

    expect(cached1).toEqual(null)
    expect(cached2).toEqual(data)
    expect(cached3).toEqual(data2)
  })
})
