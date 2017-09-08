const unwantedPaths = [
  '/html/text()',
  '/html/head/text()',
  '/html/body/text()',
  '//span[not(text())]',
  '//p[not(text())]',
  '//comment()',
  "//*[name()='o:p']",
  '//style',
  '//xml',
  '//script',
  '//meta',
  '//link',
]

function createProcessListNodeFn(doc, element, nodesToBeRemoved) {
  let elmIndex
  const listFragment = document.createDocumentFragment()
  return (cNode, index) => {
    if (cNode === element) {
      elmIndex = index
    }
    if (elmIndex !== undefined) {
      const numberTest = cNode.firstChild.textContent.trim().replace('.', '')
      let type = 'bullet'
      if (parseInt(numberTest, 10)) {
        type = 'number'
      }
      const listItem = document.createElement('li')
      listItem.appendChild(cNode.lastChild)
      listFragment.append(listItem)
      if (cNode.className === 'MsoListParagraphCxSpLast') {
        const listContainer = document.createElement(type == 'number' ? 'ol' : 'ul')
        listContainer.appendChild(listFragment)
        cNode.parentNode.replaceChild(listContainer, cNode)
        elmIndex = undefined
      } else {
        nodesToBeRemoved.push(cNode)
      }
    }
  }
}


export default function cleanUpWordDocument(html) {

  const doc = new DOMParser().parseFromString(html, 'text/html')

  // Remove cruft
  const unwantedNodes = document.evaluate(
    `${unwantedPaths.join('|')}`,
    doc,
    null,
    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
    null
  )
  for (let i = unwantedNodes.snapshotLength - 1; i >= 0; i--) {
    const unwanted = unwantedNodes.snapshotItem(i)
    unwanted.parentNode.removeChild(unwanted)
  }

  // Transform titles into H1s
  const titleElments = document.evaluate("//p[@class='MsoTitle']", doc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null)
  for (let i = titleElments.snapshotLength - 1; i >= 0; i--) {
    const title = titleElments.snapshotItem(i)
    const h1 = document.createElement('h1')
    h1.appendChild(new Text(title.textContent))
    title.parentNode.replaceChild(h1, title)
  }

  // Transform Word-lists into HTML-lists
  const listFirstElements = document.evaluate("//p[@class='MsoListParagraphCxSpFirst']", doc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null)
  if (listFirstElements.snapshotLength) {
    for (let i = listFirstElements.snapshotLength - 1; i >= 0; i--) {
      const element = listFirstElements.snapshotItem(i)
      const nodesToBeRemoved = []
      element.parentNode.childNodes.forEach(
        createProcessListNodeFn(doc, element, nodesToBeRemoved)
      )
      nodesToBeRemoved.forEach(node => {
        node.parentNode.removeChild(node)
      })
    }
  }
  const newHtml = (new XMLSerializer()).serializeToString(doc)
  return newHtml
}
