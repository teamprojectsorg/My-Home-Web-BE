const db = require('../database/sequelize')
const { DataTypes } = require('sequelize')

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
    isAvailable: DataTypes.BOOLEAN,
    location: DataTypes.TEXT,
    area: DataTypes.TEXT,
    forRent: DataTypes.BOOLEAN,
    forSale: DataTypes.BOOLEAN,
    squareFeet: DataTypes.INTEGER,
    details: DataTypes.TEXT,
    highlights: DataTypes.ARRAY(DataTypes.TEXT),
    price: DataTypes.INTEGER
}, {
    tableName: 'PropertyListing',
    timestamps: false
})

module.exports = PropertyListing