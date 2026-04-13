describe('Music cards', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.injectAxe()
  })

  it('lists cards from app data', () => {
    cy.contains('h2.card-title', 'Blinding Lights').should('be.visible')
    cy.contains('h2.card-title', 'Bad Guy').should('be.visible')
  })

  it('shows artist inside the Blinding Lights card', () => {
    cy.contains('h2.card-title', 'Blinding Lights')
      .closest('section.card')
      .should('be.visible')
      .within(() => {
        cy.contains('The Weeknd')
      })
  })

  it('marks external streaming links safely', () => {
    cy.contains('h2.card-title', 'Blinding Lights')
      .closest('section.card')
      .within(() => {
        cy.contains('a', 'YouTube').should('have.attr', 'rel', 'noopener noreferrer')
        cy.contains('a', 'Spotify').should('have.attr', 'rel', 'noopener noreferrer')
      })
  })
})
