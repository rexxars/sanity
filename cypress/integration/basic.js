/* eslint-env mocha */
/* global cy */
describe('basics', () => {
  it('has the basics', () => {
    cy.visit('http://localhost:3333/')

    cy.get('.TypePaneItem_link_2-WfT:first').click()
  })
})
