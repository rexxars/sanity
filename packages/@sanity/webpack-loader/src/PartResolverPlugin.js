'use strict'

const qs = require('querystring')
const path = require('path')
const partResolver = require('@sanity/resolver')
const emptyPart = require.resolve('./emptyPart')
const debugPart = require.resolve('./debugPart')
const unimplementedPart = require.resolve('./unimplementedPart')
const partMatcher = /^(all:)?part:[@A-Za-z0-9_-]+\/[A-Za-z0-9_/-]+/
const configMatcher = /^config:(@?[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+|[A-Za-z0-9_-]+)$/

const isSanityPart = request =>
  partMatcher.test(request.request) || configMatcher.test(request.request)

const PartResolverPlugin = function (options) {
  if (!options || !options.basePath) {
    throw new Error(
      '`basePath` option must be specified in part resolver plugin constructor'
    )
  }

  this.environment = options.env
  this.basePath = options.basePath
  this.additionalPlugins = options.additionalPlugins || []
  this.configPath = path.join(this.basePath, 'config')
}

PartResolverPlugin.prototype.apply = function (compiler) {
  const env = this.environment
  const basePath = this.basePath
  const additionalPlugins = this.additionalPlugins
  const configPath = this.configPath

  compiler.plugin('watch-run', (watcher, cb) => cacheParts(watcher).then(cb).catch(cb))
  compiler.plugin('run', (params, cb) => cacheParts(params).then(cb).catch(cb))

  function cacheParts(params) {
    const instance = params.compiler || params
    instance.sanity = compiler.sanity || {basePath: basePath}
    return partResolver
      .resolveParts({env, basePath, additionalPlugins})
      .then(parts => {
        instance.sanity.parts = parts
      })
  }

  compiler.resolvers.normal.plugin('module', function (request, callback) {
    const parts = compiler.sanity.parts
    const sanityPart = request.request.replace(/^all:/, '')

    // The debug part should return the whole part/plugin tree
    if (request.request === 'sanity:debug') {
      return this.doResolve(['file'], getResolveOptions({
        resolveTo: debugPart,
        request: request,
      }), callback)
    }

    // The versions part should return a list of module versions
    if (request.request === 'sanity:versions') {
      return this.doResolve(['file'], getResolveOptions({
        resolveTo: debugPart,
        request: request,
      }), callback)
    }

    // Configuration files resolve to a specific path
    // Either the root sanity.json or a plugins JSON config
    const configMatch = request.request.match(configMatcher)
    if (configMatch) {
      const configFor = configMatch[1]
      const req = Object.assign({}, request, {
        request: configFor === 'sanity'
          ? path.join(basePath, 'sanity.json')
          : path.join(configPath, `${configMatch[1]}.json`)
      })

      if (configFor === 'sanity') {
        req.query = `?${qs.stringify({sanityPart: request.request})}`
      }

      return this.doResolve(['file'], req, callback)
    }

    // If it doesn't match the string pattern of a Sanity part, stop trying to resolve it
    if (!isSanityPart(request)) {
      return callback()
    }

    const loadAll = request.request.indexOf('all:') === 0
    const allowUnimplemented = request.query === '?'
    const part = parts.implementations[sanityPart]

    // Imports throw if they are not implemented, except if they
    // are prefixed with `all:` (returns an empty array) or they
    // are postfixed with `?` (returns undefined)
    if (!part) {
      if (allowUnimplemented) {
        return this.doResolve(['file'], {request: unimplementedPart}, callback)
      }

      if (loadAll) {
        return this.doResolve(['file'], {request: emptyPart}, callback)
      }

      return callback(new Error(
        `Part "${sanityPart}" not implemented by any plugins`
      ))
    }

    const resolveOpts = getResolveOptions({
      resolveTo: part[0].path,
      request: request,
    })

    return this.doResolve(['file', 'directory'], resolveOpts, callback)
  })
}

function getResolveOptions(options) {
  const reqQuery = (options.request.query || '').replace(/^\?/, '')
  const query = Object.assign({}, qs.parse(reqQuery) || {}, {
    sanityPart: options.request.request,
  })

  return Object.assign({}, options.request, {
    request: options.resolveTo,
    query: `?${qs.stringify(query)}`
  })
}

module.exports = PartResolverPlugin
