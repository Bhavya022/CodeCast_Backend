module.exports = {
  db: {
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false,
  },
  jwtSecret: 'misogiai', // Change this in production
}; 