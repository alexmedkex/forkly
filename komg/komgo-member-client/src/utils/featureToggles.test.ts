import { getEnabledFeatureToggles } from './featureToggles'

describe('featureToggles', () => {
  const OLD_ENV = process.env

  describe('getEnabledFeatureToggles', () => {
    beforeEach(() => {
      jest.resetModules()
      process.env = { ...OLD_ENV }
      delete process.env.REACT_APP_ALLOW_FEATURE_TOGGLES
      delete process.env.REACT_APP_ENABLED_FEATURE_TOGGLES
    })

    afterEach(() => {
      process.env = OLD_ENV
    })

    it('should return empty feature toggles when using query parameteres if features toggles disabled', () => {
      const enabledFeatures = getEnabledFeatureToggles('?ftoggles=dummy')

      expect(enabledFeatures.length).toEqual(0)
    })

    it('should return empty feature toggles when using query parameteres if features toggles are disabled (undefined)', () => {
      process.env.REACT_APP_ENABLED_FEATURE_TOGGLES = undefined

      const enabledFeatures = getEnabledFeatureToggles('?ftoggles=dummy')

      expect(enabledFeatures.length).toEqual(0)
    })

    it('should return empty feature toggles when using query parameteres if allow env variable has invalid boolean', () => {
      process.env.REACT_APP_ENABLED_FEATURE_TOGGLES = 'hello'

      const enabledFeatures = getEnabledFeatureToggles('?ftoggles=dummy')

      expect(enabledFeatures.length).toEqual(0)
    })

    it('should return empty feature toggles when using query parameteres if allow env variable has invalid boolean (other case)', () => {
      process.env.REACT_APP_ENABLED_FEATURE_TOGGLES = '{}'

      const enabledFeatures = getEnabledFeatureToggles('?ftoggles=dummy')

      expect(enabledFeatures.length).toEqual(0)
    })

    it('should return with no enabled feature toggles when feature toggles are not allowed', () => {
      process.env.REACT_APP_ENABLED_FEATURE_TOGGLES = 'dummy'

      const enabledFeatures = getEnabledFeatureToggles('')

      expect(enabledFeatures.length).toEqual(0)
    })

    it('should return empty feature toggles', () => {
      process.env.REACT_APP_ALLOW_FEATURE_TOGGLES = 'true'

      expect(getEnabledFeatureToggles('').length).toEqual(0)
    })

    it('should be enabled if passed by query parameter', () => {
      process.env.REACT_APP_ALLOW_FEATURE_TOGGLES = 'true'

      const enabledFeatures = getEnabledFeatureToggles('?ftoggles=dummy')

      expect(enabledFeatures.length).toEqual(1)
      expect(enabledFeatures).toContain('dummy')
    })

    it('should be enabled multiple features if passed by query parameter', () => {
      process.env.REACT_APP_ALLOW_FEATURE_TOGGLES = 'true'

      const enabledFeatures = getEnabledFeatureToggles('?ftoggles=dummy,fab')

      expect(enabledFeatures.length).toEqual(2)
      expect(enabledFeatures).toContain('dummy')
      expect(enabledFeatures).toContain('fab')
    })

    it('should enable multiple features if passed by env variable', () => {
      process.env.REACT_APP_ALLOW_FEATURE_TOGGLES = 'true'
      process.env.REACT_APP_ENABLED_FEATURE_TOGGLES = 'dummy, fab,fab2 ,fab3'

      const enabledFeatures = getEnabledFeatureToggles('')

      expect(enabledFeatures.length).toEqual(4)
      expect(enabledFeatures).toContain('dummy')
      expect(enabledFeatures).toContain('fab')
      expect(enabledFeatures).toContain('fab2')
      expect(enabledFeatures).toContain('fab3')
    })

    it('should enabled multiple features if passed by environment variable and query string parameter', () => {
      process.env.REACT_APP_ALLOW_FEATURE_TOGGLES = 'true'
      process.env.REACT_APP_ENABLED_FEATURE_TOGGLES = 'dummy'

      const enabledFeatures = getEnabledFeatureToggles('?ftoggles=fab, fab2,fab3 ')

      expect(enabledFeatures.length).toEqual(4)
      expect(enabledFeatures).toContain('dummy')
      expect(enabledFeatures).toContain('fab')
      expect(enabledFeatures).toContain('fab2')
      expect(enabledFeatures).toContain('fab3')
    })
  })
})
