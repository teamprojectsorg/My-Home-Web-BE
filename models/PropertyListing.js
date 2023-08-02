const db = require('../database/sequelize')
const { DataTypes } = require('sequelize')

const PropertyImage = require('./PropertyImage')
const PropertyReview = require('./PropertyReview')

const PropertyListing = db.define('PropertyListing', {
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
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true
    },
    location: DataTypes.TEXT,
    area: DataTypes.TEXT,
    details: DataTypes.TEXT,
    price: DataTypes.INTEGER
}, {
    tableName: 'PropertyListing',
    timestamps: false
})

PropertyListing.hasMany(PropertyImage)
PropertyListing.hasMany(PropertyReview)

module.exports = UserProfile