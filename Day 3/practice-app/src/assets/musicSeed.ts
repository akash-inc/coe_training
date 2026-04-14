import type { MusicCard } from '../types/music'

export const musicSeed: MusicCard[] = [
  {
    id: 1,
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    year: 2020,
    genres: ['Synthpop', 'R&B'],
    link: {
      youtube: 'https://www.youtube.com/watch?v=4NRXx6U8ABQ',
      spotify: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b',
    },
    image:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=facearea&w=500&h=500',
  },
  {
    id: 2,
    title: 'Bad Guy',
    artist: 'Billie Eilish',
    album: 'When We All Fall Asleep, Where Do We Go?',
    year: 2019,
    genres: ['Pop', 'Electropop'],
    link: {
      youtube: 'https://www.youtube.com/watch?v=DyDfgMOUjCI',
      spotify: 'https://open.spotify.com/track/2Fxmhks0bxGSBdJ92vM42m',
    },
    image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=500&h=500',
  },
  {
    id: 3,
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: 'Divide',
    year: 2017,
    genres: ['Pop'],
    link: {
      youtube: 'https://www.youtube.com/watch?v=JGwWNGJdvx8',
      spotify: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3',
    },
    image:
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=500&h=500',
  },
  {
    id: 4,
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    year: 1975,
    genres: ['Rock', 'Progressive rock'],
    link: {
      youtube: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
      spotify: 'https://open.spotify.com/track/7tFiyTwD0nx5a1eklYtX2J',
    },
    image:
      'https://images.unsplash.com/photo-1454023492550-5696f8ff10e1?auto=format&fit=facearea&w=500&h=500',
  },
  {
    id: 5,
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    year: 2020,
    genres: ['Disco', 'Pop'],
    link: {
      youtube: 'https://www.youtube.com/watch?v=TUVcZfQe-Kw',
      spotify: 'https://open.spotify.com/track/463CkQjx2Zk1yXoBuierM9',
    },
    image:
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=500&h=500',
  },
]

export const defaultCoverImage = musicSeed[0].image
