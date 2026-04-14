describe('Music cards', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.injectAxe()
  })

  it('lists cards from app data', () => {
    cy.contains('h3.card-title', 'Blinding Lights').should('be.visible')
    cy.contains('h3.card-title', 'Bad Guy').should('be.visible')
  })

  it('shows artist inside the Blinding Lights card', () => {
    cy.contains('h3.card-title', 'Blinding Lights')
      .closest('article.card')
      .should('be.visible')
      .within(() => {
        cy.contains('The Weeknd')
      })
  })

  it('marks external streaming links safely', () => {
    cy.contains('h3.card-title', 'Blinding Lights')
      .closest('article.card')
      .within(() => {
        cy.contains('a', 'YouTube').should('have.attr', 'rel', 'noopener noreferrer')
        cy.contains('a', 'Spotify').should('have.attr', 'rel', 'noopener noreferrer')
      })
  })

  it('can filter by search and genre', () => {
    cy.get('#card-search').type('queen')
    cy.contains('h3.card-title', 'Bohemian Rhapsody').should('be.visible')
    cy.contains('h3.card-title', 'Bad Guy').should('not.exist')

    cy.get('#card-search').clear()
    cy.get('#genre-filter').select('Rock')
    cy.contains('h3.card-title', 'Bohemian Rhapsody').should('be.visible')
  })
})
