function getAccessToken() {
  return localStorage.getItem('access_token')
}

function setAccessToken(token) {
  localStorage.setItem('access_token', token)
}

function clearAccessToken() {
  localStorage.removeItem('access_token')
}

export { getAccessToken, setAccessToken, clearAccessToken }