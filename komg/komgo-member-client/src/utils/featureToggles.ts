export enum FeatureToggle {
  Default = 'default',
  NewRequestDocuments = 'newRequestDocuments',
  CompanyDeactivation = 'deactivation'
}

const FEATURE_PARAM_NAME = 'ftoggles'

export const isFeatureToggleEnabled = (featureToggle: FeatureToggle, queryString: string): boolean => {
  const features = getEnabledFeatureToggles(queryString)
  return features.includes(featureToggle)
}

export const getEnabledFeatureToggles = (queryString: string): string[] => {
  let features = []
  // We must use string interpolation, otherwise webpack will put a result of the expression, i.e. false
  // That's because string '%REACT_APP_ALLOW_FEATURE_TOGGLES%' !== 'true' (see Dockerfile)
  const allowFeatureToggles = `${process.env.REACT_APP_ALLOW_FEATURE_TOGGLES}`

  if (allowFeatureToggles === 'true') {
    if (process.env.REACT_APP_ENABLED_FEATURE_TOGGLES) {
      const envFeatures = process.env.REACT_APP_ENABLED_FEATURE_TOGGLES.split(',').map(f => f.trim())
      features = features.concat(envFeatures)
    }

    const urlSearchParams = new URLSearchParams(queryString)
    if (urlSearchParams.has(FEATURE_PARAM_NAME)) {
      const queryFeatures = urlSearchParams
        .get(FEATURE_PARAM_NAME)
        .split(',')
        .map(f => f.trim())
      features = features.concat(queryFeatures)
    }
  }
  return features
}
