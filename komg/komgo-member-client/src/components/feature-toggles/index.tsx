import * as React from 'react'
import { FeatureToggle } from '../../utils/featureToggles'
import { Feature as ParallelFeature, Component } from '@paralleldrive/react-feature-toggles'
import { FeatureToggles as FeatureProvider } from '@paralleldrive/react-feature-toggles'

export interface FeatureProps {
  children: React.ReactNode
  featureToggle: FeatureToggle
  inactiveComponent?: Component
}

export const Feature: React.SFC<FeatureProps> = (props: FeatureProps) => (
  <ParallelFeature
    name={props.featureToggle}
    activeComponent={() => (typeof props.children === 'object' ? props.children : props.children[0])}
    inactiveComponent={props.inactiveComponent}
  />
)

export { FeatureProvider }
