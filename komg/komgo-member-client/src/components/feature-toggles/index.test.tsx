import * as React from 'react'
import * as renderer from 'react-test-renderer'

import { Feature, FeatureProvider } from '.'
import { FeatureToggle } from '../../utils/featureToggles'

describe('FeatureEnabler', () => {
  it('should not show feature if is not included', () => {
    const features = []
    expect(
      renderer
        .create(
          <FeatureProvider features={features}>
            <Feature featureToggle={FeatureToggle.Default}>
              <p>test1</p>
            </Feature>
          </FeatureProvider>
        )
        .toJSON()
    ).toMatchSnapshot()
  })

  it('should show feature if is included', () => {
    const features = [FeatureToggle.Default]
    expect(
      renderer
        .create(
          <FeatureProvider features={features}>
            <Feature featureToggle={FeatureToggle.Default}>
              <p>test1</p>
            </Feature>
          </FeatureProvider>
        )
        .toJSON()
    ).toMatchSnapshot()
  })

  it('should not show feature if is not included but contain different ones', () => {
    const features = ['dummyFt']
    expect(
      renderer
        .create(
          <FeatureProvider features={features}>
            <Feature featureToggle={FeatureToggle.Default}>
              <p>test1</p>
            </Feature>
          </FeatureProvider>
        )
        .toJSON()
    ).toMatchSnapshot()
  })

  it('should show inactive component if FeatureToggle is not included', () => {
    const features = []
    expect(
      renderer
        .create(
          <FeatureProvider features={features}>
            <Feature featureToggle={FeatureToggle.Default} inactiveComponent={() => <p>testInactive</p>}>
              <p>test1</p>
            </Feature>
          </FeatureProvider>
        )
        .toJSON()
    ).toMatchSnapshot()
  })
})
