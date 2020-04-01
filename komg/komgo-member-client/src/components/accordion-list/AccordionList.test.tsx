import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { AccordionList, HasIdAndName } from './AccordionList'
import { fakeHasIdAndName } from './faker'
import { groupBy } from '../../features/document-management/components/documents/my-documents/toMap'

interface FooBar extends HasIdAndName {
  bar: HasIdAndName
}
describe('AccordionList', () => {
  const foos = ['1', '2', '3', '4'].map(id => fakeHasIdAndName({ id, name: `foo-${id}` }))
  const bars = ['1', '2'].map(id => fakeHasIdAndName({ id, name: `bar-${id}` }))
  const [oddBar, evenBar] = bars
  const fooBars: FooBar[] = foos.map(foo => {
    const bar = +foo.id % 2 === 0 ? oddBar : evenBar
    return { ...foo, bar }
  })

  const foosBarsByBar = groupBy(fooBars, foo => foo.bar.id)
  const barsById = groupBy(bars, bar => bar.id)

  const barRenderer = (bar: HasIdAndName) => (
    <div>{`${bar.name} has ${foosBarsByBar.get(bar.id).length} foobars: `}</div>
  )
  const fooBarRenderer = (foobar: FooBar) => <div>{`${foobar.name}`}</div>
  it('renders', () => {
    expect(
      renderer
        .create(
          <AccordionList
            panelRenderer={jest.fn()}
            listRenderer={jest.fn()}
            groupedListItems={foosBarsByBar}
            groupedPanelItems={barsById}
            panelTitleRenderer={barRenderer}
            listItemRenderer={fooBarRenderer}
          />
        )
        .toJSON()
    ).toMatchSnapshot()
  })
})
