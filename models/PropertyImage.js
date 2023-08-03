const db = require('../database/sequelize')
const { DataTypes } = require('sequelize')

const PropertyImage = db.define('PropertyImage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    description: DataTypes.TEXT,
    url: DataTypes.TEXT
}, {
    tableName: 'PropertyImage',
    timestamps: false
})

module.exports = PropertyImage