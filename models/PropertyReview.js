const db = require('../database/sequelize')
const { DataTypes } = require('sequelize')

const PropertyReview = db.define('PropertReview', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
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
    rating: DataTypes.INTEGER,
    reviewTitle: DataTypes.TEXT,
    reviewDescription: DataTypes.TEXT
}, {
    tableName: 'PropertyReview',
    timestamps: false
})

module.exports = PropertyReview