export type StreamingLinks = {
  youtube?: string
  spotify?: string
}

export type MusicCard = {
  id: number
  title: string
  artist: string
  album: string
  year: number
  genres: string[]
  link: StreamingLinks
  image: string
}

export type MusicCardFormValues = {
  title: string
  artist: string
  album: string
  year: string
  genres: string
  youtube: string
  spotify: string
  image: string
}
