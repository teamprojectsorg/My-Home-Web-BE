const db = require('../database/sequelize')
const { DataTypes } = require('sequelize')

const PropertyListing = require('./PropertyListing')

const PropertyImage = db.define('PropertyImage', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    name: DataTypes.TEXT,
    description: DataTypes.TEXT,
    url: DataTypes.TEXT
}, {
    tableName: 'PropertyImage',
    timestamps: false
})

PropertyImage.belongsTo(PropertyListing)

module.exports = UserProfile