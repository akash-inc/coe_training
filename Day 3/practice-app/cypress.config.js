import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'src/tests/cypress/e2e/**/*.cy.js',
    supportFile: 'src/tests/cypress/support/e2e.js',
    video: false,
  },
})
