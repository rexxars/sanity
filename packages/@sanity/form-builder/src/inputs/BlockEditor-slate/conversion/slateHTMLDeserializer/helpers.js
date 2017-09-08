import cleanUpWordDocument from './cleanUpWordDocument'

const wordRegexp = /(class="?Mso|style=(?:"|')[^"]*?\bmso-|w:WordDocument|<o:\w+>|<\/font>)/

export function isPastedFromGoogleDocs(el) {
  if (el.nodeType !== 1) {
    return false
  }
  const id = el.getAttribute('id')
  return id && id.match(/^docs-internal-guid-/)
}

export function isPastedFromWord(html) {
  return wordRegexp.test(html)
}

export function cleanHtml(html) {
  let cleanedHtml = html
  if (isPastedFromWord(html)) {
    cleanedHtml = cleanUpWordDocument(html)
  }
  cleanedHtml = cleanedHtml
    .trim()   // Trim whitespace
    .replace(/[\r\n]+/g, ' ') // Remove newlines / carriage returns
    .replace(/ {2,}/g, ' ') // Remove trailing spaces
  return cleanedHtml
}

export function resolveListItem(listNodeTagName) {
  let listStyle
  switch (listNodeTagName) {
    case 'ul':
      listStyle = 'bullet'
      break
    case 'ol':
      listStyle = 'number'
      break
    default:
      listStyle = 'bullet'
  }
  return listStyle
}
