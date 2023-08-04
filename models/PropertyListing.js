const db = require('../database/sequelize')
const { DataTypes } = require('sequelize')

const PropertyListing = db.define('PropertyListing', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    isAvailable: DataTypes.BOOLEAN,
    location: DataTypes.TEXT,
    area: DataTypes.TEXT,
    forRent: DataTypes.BOOLEAN,
    forSale: DataTypes.BOOLEAN,
    squareFeet: DataTypes.INTEGER,
    details: DataTypes.TEXT,
    highlights: DataTypes.ARRAY(DataTypes.TEXT),
    price: DataTypes.INTEGER,
    sold: DataTypes.BOOLEAN
}, {
    tableName: 'PropertyListing',
    timestamps: false
})

module.exports = PropertyListing