import client from 'part:@sanity/base/client'
import {observePaths} from 'part:@sanity/base/preview'
import {withMaxConcurrency} from '../../utils/withMaxConcurrency'

const MAX_CONCURRENT_UPLOADS = 4

async function uploadSanityAsset(assetType, file) {
  const documentType = `sanity.${assetType}Asset`
  const hash = await hashFile(file)
  if (hash) {
    client.observable
      .fetch('*[_type == $documentType && sha1sum == $hash][0]', {documentType, hash})
      .subscribe() // If we get a result back, map to same shape as below, otherwise do upload
  }

  return client.observable.assets.upload(assetType, file).map(event => {
    return event.type === 'response'
      ? {
          // rewrite to a 'complete' event
          type: 'complete',
          id: event.body.document._id,
          asset: event.body.document
        }
      : event
  })
}

const uploadAsset = withMaxConcurrency(uploadSanityAsset, MAX_CONCURRENT_UPLOADS)

export const uploadImageAsset = file => uploadAsset('image', file)
export const uploadFileAsset = file => uploadAsset('file', file)

export function materializeReference(id) {
  return observePaths(id, ['originalFilename', 'url', 'metadata'])
}

function hashFile(file) {
  if (!window.crypto || !window.crypto.subtle || !window.FileReader) {
    return false
  }

  const reader = new FileReader()
  reader.onload = () =>
    crypto.subtle.digest('SHA-1', reader.result).then(hash => {
      hexFromBuffer(hash) // Resolve with this
    })
  reader.readAsArrayBuffer(file)
}

function hexFromBuffer(buffer) {
  return Array.prototype.map
    .call(new Uint8Array(buffer), x => `00${x.toString(16)}`.slice(-2))
    .join('')
}
