const db = require('../database/sequelize')
const { DataTypes } = require('sequelize')

const User = require('./User')

const UserProfile = db.define('UserProfile', {
    userId: {
        type: DataTypes.UUID,
        references: {
            model: User,
            key: 'id'
        },
        primaryKey: true
    },
    firstName: DataTypes.TEXT,
    surname: DataTypes.TEXT,
    residence: DataTypes.TEXT,
    area: DataTypes.TEXT,
    legalId: DataTypes.TEXT,
    legalIdType: DataTypes.ENUM('PASSPORT', 'NATIONAL_ID', 'LICENSE'),
    phoneNumber: DataTypes.TEXT
}, {
    tableName: 'UserProfile',
    timestamps: false
})

module.exports = UserProfile