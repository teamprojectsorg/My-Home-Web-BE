const { Sequelize } = require('sequelize');

module.exports = new Sequelize(process.env.SUPABASE_POSTGRES_URI);