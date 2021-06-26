module.exports = {
  development: {
    client: "sqlite3",
    connection: JSON.parse(
      process.env.DB_CONNSTR ?? '{"filename":"./db/dev.sqlite3"}'
    ),
    migrations: {
      directory: "./db/migrations",
    },
    useNullAsDefault: true,
  },
};
