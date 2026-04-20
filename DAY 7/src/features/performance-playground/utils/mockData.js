export function buildNumberSet(size = 10000) {
  return Array.from({ length: size }, (_, index) => (index * 17) % 997)
}

export function buildListItems(size = 50000) {
  return Array.from({ length: size }, (_, index) => ({
    id: index + 1,
    label: `Item ${index + 1}`,
  }))
}

export function buildPeople(size = 100) {
  return Array.from({ length: size }, (_, index) => ({
    id: index + 1,
    name: `User ${index + 1}`,
  }))
}
