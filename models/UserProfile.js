const db = require('../database/sequelize')
const { DataTypes } = require('sequelize')

const UserProfile = db.define('UserProfile', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: {
        type: DataTypes.UUID,
        references: {
            key: 'id',
            model: {
                tableName: 'users',
                schema: 'auth'
            }
        },
        unique: true
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