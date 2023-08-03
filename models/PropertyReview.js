const db = require('../database/sequelize')
const { DataTypes } = require('sequelize')

const PropertyReview = db.define('PropertyReview', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    rating: DataTypes.INTEGER,
    reviewTitle: DataTypes.TEXT,
    reviewDescription: DataTypes.TEXT
}, {
    tableName: 'PropertyReview',
    timestamps: false
})

module.exports = PropertyReview