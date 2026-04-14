describe('Form', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.injectAxe()
  })

  it('should have no axe violations on the main content', () => {
    cy.get('main#main-content').should('be.visible')
    cy.checkA11y('main#main-content')
  })

  it('adds a music card to the list and supports edit mode', () => {
    cy.get('input[name="title"]').should('be.visible').type('E2E Test Track')
    cy.get('input[name="artist"]').should('be.visible').type('E2E Artist')
    cy.get('input[name="album"]').should('be.visible').type('E2E Album')
    cy.get('input[name="year"]').clear().type('2024')
    cy.get('input[name="genre"]').should('be.visible').type('Indie, Electronic')

    cy.contains('button', 'Add music card').click()

    cy.contains('h3.card-title', 'E2E Test Track')
      .closest('article.card')
      .should('be.visible')
      .within(() => {
        cy.get('h3.card-title').should('contain.text', 'E2E Test Track')
        cy.contains('E2E Artist')
        cy.contains('E2E Album')
        cy.contains('2024')
        cy.contains('Indie')
        cy.contains('Electronic')
      })

    cy.contains('h3.card-title', 'E2E Test Track').closest('article.card').contains('button', 'Edit card').click()
    cy.get('input[name="title"]').clear().type('E2E Updated Track')
    cy.contains('button', 'Save changes').click()
    cy.contains('h3.card-title', 'E2E Updated Track').should('be.visible')
  })
})
