const PropertyListing = require('./PropertyListing')
const PropertyImage = require('./PropertyImage')
const PropertyReview = require('./PropertyReview')

function relations() {
    PropertyListing.hasMany(PropertyImage, { onDelete: 'CASCADE' })
    PropertyListing.hasMany(PropertyReview, { onDelete: 'CASCADE' })

    PropertyImage.belongsTo(PropertyListing)
    PropertyImage.belongsTo(PropertyListing)
}

module.exports = relations()