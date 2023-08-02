const db = require('../database/sequelize')
const { DataTypes } = require('sequelize')

const PropertyImage = db.define('PropertyImage', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
    },
    description: DataTypes.TEXT,
    url: DataTypes.TEXT
}, {
    tableName: 'PropertyImage',
    timestamps: false
})

module.exports = PropertyImage