/* eslint-disable no-empty-function, no-process-env */
const getIt = require('get-it')
const assign = require('object-assign')
const observable = require('get-it/lib/middleware/observable')
const jsonRequest = require('get-it/lib/middleware/jsonRequest')
const jsonResponse = require('get-it/lib/middleware/jsonResponse')
const SanityObservable = require('@sanity/observable/minimal')
const progress = require('get-it/lib/middleware/progress')
const {ClientError, ServerError} = require('./errors')

const httpError = ({
  onResponse: res => {
    if (res.statusCode >= 500) {
      throw new ServerError(res)
    } else if (res.statusCode >= 400) {
      throw new ClientError(res)
    }

    return res
  }
})

const middleware = [
  jsonRequest(),
  jsonResponse(),
  progress(),
  httpError,
  observable({implementation: SanityObservable})
]

// Don't include debug middleware in browsers
if (process.env.BROWSERIFY_ENV !== 'build') {
  const debug = require('get-it/lib/middleware/debug')
  middleware.unshift(debug({verbose: true, namespace: 'sanity:client'}))
}

const request = getIt(middleware)

function httpRequest(options, requester = request) {
  return requester(assign({maxRedirects: 0}, options))
}

httpRequest.defaultRequester = request
httpRequest.ClientError = ClientError
httpRequest.ServerError = ServerError

module.exports = httpRequest
