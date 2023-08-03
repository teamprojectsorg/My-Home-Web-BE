const db = require('../database/sequelize')
const { DataTypes } = require('sequelize')

const User = db.define('User', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true
    }
}, {
    tableName: 'users',
    schema: 'auth'
})

module.exports = User