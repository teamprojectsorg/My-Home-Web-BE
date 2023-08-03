const User = require('./User')
const UserProfile = require('./UserProfile')
const PropertyListing = require('./PropertyListing')
const PropertyImage = require('./PropertyImage')
const PropertyReview = require('./PropertyReview')

User.hasMany(PropertyListing, { foreignKey: 'userId' })
User.hasMany(PropertyImage, { foreignKey: 'userId' })
User.hasMany(PropertyReview, { foreignKey: 'userId' })
PropertyListing.hasMany(PropertyImage, { foreignKey: 'propertyListingId' })
PropertyListing.hasMany(PropertyReview, { foreignKey: 'propertyListingId' })

PropertyListing.belongsTo(User, { foreignKey: 'userId' })
PropertyImage.belongsTo(User, { foreignKey: 'userId' })
PropertyReview.belongsTo(User, { foreignKey: 'userId' })
PropertyImage.belongsTo(PropertyListing, { foreignKey: 'propertyListingId' })
PropertyReview.belongsTo(PropertyListing, { foreignKey: 'propertyListingId' })

async function syncModels() {
    await User.sync()
    await UserProfile.sync({ force: true })
    await PropertyListing.sync({ force: true })
    await PropertyImage.sync({ force: true })
    await PropertyReview.sync({ force: true })
}

module.exports = {
    syncModels
}