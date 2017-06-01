# @sanity/webpack-integration

Tools and modules required for making partisan (the part system) work with webpack

## Installing

```
npm install --save @sanity/webpack-integration
```

## Usage

```js
const sanityWebpack = require('@sanity/webpack-integration')
const options = {basePath: '/path/to/project'}

// Get array of plugins required for part loading
sanityWebpack.getPlugins(options)

// Get array of loader definitions required for part loading
sanityWebpack.getLoaders(options)

// Get array of postcss plugins required to build the CSS used in Sanity
sanityWebpack.getPostcssPlugins(options)

// Get a partial webpack configuration for the Sanity-specific parts. You'll have to merge this with your existing webpack config.
sanityWebpack.getConfig(options)



// Less common, but if you need more fine-grained access to postcss plugin stuff:

// Get the resolving function required for postcss-import
sanityWebpack.getStyleResolver(options)

// Get an initialized postcss-import plugin
sanityWebpack.getPostcssImportPlugin(options)
```

## License

MIT-licensed. See LICENSE.