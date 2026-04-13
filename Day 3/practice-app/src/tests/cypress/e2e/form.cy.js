describe('Form', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.injectAxe()
  })

  it('should have no axe violations on the form', () => {
    cy.get('form.form-card').should('be.visible')
    cy.checkA11y('form.form-card')
  })

  it('adds a music card to the list and can add another', () => {
    cy.get('input[name="title"]').should('be.visible').type('E2E Test Track')
    cy.get('input[name="artist"]').should('be.visible').type('E2E Artist')
    cy.get('input[name="album"]').should('be.visible').type('E2E Album')
    cy.get('input[name="year"]').clear().type('2024')
    cy.get('input[name="genre"]').should('be.visible').type('Indie, Electronic')

    cy.get('form.form-card').submit()
    cy.contains('Music card added successfully.').should('be.visible')
    cy.contains('It now appears in the list above this form.').should('be.visible')
    cy.contains('button', 'Add Another').click()
    cy.get('form.form-card').should('be.visible')

    cy.contains('h2.card-title', 'E2E Test Track')
      .closest('section.card')
      .should('be.visible')
      .within(() => {
        cy.get('h2.card-title').should('contain.text', 'E2E Test Track')
        cy.contains('E2E Artist')
        cy.contains('E2E Album')
        cy.contains('2024')
        cy.contains('Indie')
        cy.contains('Electronic')
      })
  })
})
