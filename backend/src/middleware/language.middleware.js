export const languageMiddleware = (req, res, next) => {
  const language = req.headers['accept-language'] || 'en'
  req.language = language
  next()
}
