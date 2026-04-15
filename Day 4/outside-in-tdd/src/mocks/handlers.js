import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('https://api.openweathermap.org/data/2.5/weather', () => {
    return HttpResponse.json({ name: 'London', main: { temp: 293.15 } })
  }),
]
