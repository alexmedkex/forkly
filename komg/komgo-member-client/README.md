### Prerequisites

The following shows the minimum tools and requirements for running this project:

* Git 2.16.2 and later (including SSH setup)
* [Docker 18.03.1-CE](https://www.docker.com/community-edition#/download) and later
* Docker-compose 1.21.1 and later
* [Visual studio code](https://code.visualstudio.com)

### Installation guide

# Clone the repository

    git clone git@gitlab.com:ConsenSys/client/uk/KomGo/komgo-member-client.git

# Install dependencies

    npm install

# Run the project

    npm start

or to test via docker

    kg up client

or to rebuild the docker image

    kg up client --rebuild

or to work via the docker image

    kg up client --dev

### Software development guidelines

Refer to the [following guidelines](https://consensys-komgo.atlassian.net/wiki/spaces/KO/pages/13500418/Software+Development+Guidelines) to understand more about the motivations and architectural decisions for this project.

#### Feature Toggles

##### Usage in Code

All features are defined in the enum `FeatureToggle` defined in `import { FeatureToggle } from '../../utils/featureToggles'`

Use `Feature` to automatically show the child elements if that FeatureToggle is enabled:

```typescript
import { FeatureToggle } from '../../utils/featureToggles'

...

<Feature featureToggle={FeatureToggle.Default}>
	<p>test1</p>
</Feature>
```

Or you can do it in the code by using:

```typescript
import { isFeatureToggleEnabled, FeatureToggle } from '../../../utils/featureToggles'

...

isFeatureToggleEnabled(FeatureToggle.ReceivableDiscount, this.props.location.search))
```

##### Allow usage of Feature Toggles

To be able to use the feature toggles, you need to set the environment variable `REACT_APP_ALLOW_FEATURE_TOGGLES` to `true`.

##### Enable Feature Toggle by Environment Variable

Add each feature in the environment variable `REACT_APP_ENABLED_FEATURE_TOGGLES`, separated by commas.

Example: `REACT_APP_ENABLED_FEATURE_TOGGLES="feature1,feature2,feature3"`

##### Enable Feature Toggle by Query String

Activate feature toggles by passing them in with the query string parameter `ftoggles`, separated by commas.

Example: `http://localhost:3010/trades/new?ftoggles=receivableDiscount,feature2`

#### Cached user data

The component `components/cached-data-provider` can be used for caching data across sessions.

This component uses local storage NOT sessions storage, so please make sure that any data you store it in is:

1.  Not sensitive information
2.  Publicly accessible or irrelevant
3.  Lightweight

Also, only use this component to wrap 'dumb' components (components that are light to render and **DO NOT make heavy use** of life cycle hooks). This is because the component uses the render props pattern, causing the wrapped component to be completely re-created on each render.

##### Usage

```typescript
import { ICachedData, CachedDataProvider } from '../../../components/cached-data-provider'

class LCView extends React.Component {
  state = {
    active: false // we are active to control an accordion inside LCData for instance
  }
  render() {
    const { lc } = this.props

    return (
      <CachedDataProvider id={lc.staticId} data={lc.updatedAt}>
        {({ cached }: ICachedData<string>) => (
          <LCData
            lc={lc}
            open={active}
            isChanged={cached !== lc.updatedAt}
            handleToggleAccordion={() => this.setState({ active: !this.state.active })}
          />
        )}
      </CachedDataProvider>
    )
  }
}
```

In the example above, we have an LC component (smart) that renders an LCData component (dumb). On each render, the new lc data is cached, and the previous lc data is provided in the `ICachedData<string>`. In this case, we both cache and provide a string, but we could do any generic type.

```typescript
<CachedDataProvider
    id={lc.staticId}
    data={lc as LC}
    >
    {({ cached }: ICachedData<LC>) => ({
        ...
    })
</CachedDataProvider>
```

However, DO NOT cache sensitive data, as the storage can be accessed by any website on this device.

If you pass in `null` or `undefined` to data, the cache will not update. This is useful if you want to update the cache based on some state, for instance update the cache only when the 'user has seen the data', indicated by an open accordion.

Caching occurs on componentDidMount or componentDidUpdate (after render) so does not affect the current render, only the next one.

```
import { ICachedData, CachedDataProvider } from '../../../components/cached-data-provider'

class LCView extends React.Component {
    state = {
        active: false // we are active to control an accordion inside LCData for instance
    }
    render() {
        const { lc } = this.props

        return (
            <CachedDataProvider
                id={lc.staticId}
                data={active ? lc.updatedAt : null}
                >
                ...
            </CachedDataProvider>
        )
    }
}
```
