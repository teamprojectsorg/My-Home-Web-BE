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
    listingCategory: DataTypes.ENUM('LAND', 'HOUSE'),
    listingType: DataTypes.ENUM('RENT', 'SALE', 'LEASE'),
    bedrooms: DataTypes.INTEGER,
    squareFeet: DataTypes.INTEGER,
    details: DataTypes.TEXT,
    highlights: DataTypes.ARRAY(DataTypes.TEXT),
    price: DataTypes.INTEGER,
    sold: DataTypes.BOOLEAN,
    thumbnail: DataTypes.TEXT
}, {
    tableName: 'PropertyListing',
    paranoid: true
})

module.exports = PropertyListing