import webpack from 'webpack'
import {find, get, set} from 'lodash'
import registerBabel from 'babel-register'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import {getBaseServer, applyStaticRoutes, callInitializers} from './baseServer'
import getWebpackDevConfig from './configs/webpack.config.dev'

export default function getDevServer(config = {}) {
  const app = getBaseServer(config)
  const webpackConfig = config.webpack || getWebpackDevConfig(config)

  // Serve an empty CSS file for the main stylesheet,
  // as they are injected dynamically in development mode
  app.get('/static/css/main.css', (req, res) => {
    res.set('Content-Type', 'text/css')
    res.send()
  })

  // Use babel-register in order to be able to load things like
  // the document component, which can contain JSX etc
  registerBabel()

  // Inject hot module reloading preset if not present already
  const babelLoader = find(webpackConfig.module.loaders, {loader: 'babel'})
  if (babelLoader) {
    const presets = get(babelLoader, 'query.env.development.presets', [])
    if (presets.indexOf('react-hmre') === -1) {
      set(
        babelLoader,
        'query.env.development.presets',
        presets.concat(require.resolve('babel-preset-react-hmre'))
      )
    }
  }

  // Apply the dev and hot middlewares to build/serve bundles on the fly
  const compiler = webpack(webpackConfig)
  app.use(webpackDevMiddleware(compiler, {
    quiet: true,
    noInfo: true,
    watchOptions: {
      ignored: /node_modules/
    },
    publicPath: webpackConfig.output.publicPath,
    stats: true
  }))

  app.use(webpackHotMiddleware(compiler))

  // Expose webpack compiler on server instance
  app.locals.compiler = compiler

  // Call any registered initializers
  callInitializers(config)

  return applyStaticRoutes(app, config)
}
