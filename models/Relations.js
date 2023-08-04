const User = require('./User')
const UserProfile = require('./UserProfile')
const PropertyListing = require('./PropertyListing')
const PropertyImage = require('./PropertyImage')
const PropertyReview = require('./PropertyReview')

UserProfile.hasMany(PropertyListing, { foreignKey: 'userId' })
UserProfile.hasMany(PropertyImage, { foreignKey: 'userId' })
UserProfile.hasMany(PropertyReview, { foreignKey: 'userId' })
PropertyListing.hasMany(PropertyImage, { foreignKey: 'propertyListingId' })
PropertyListing.hasMany(PropertyReview, { foreignKey: 'propertyListingId' })

PropertyListing.belongsTo(UserProfile, { foreignKey: 'userId' })
PropertyImage.belongsTo(UserProfile, { foreignKey: 'userId' })
PropertyReview.belongsTo(UserProfile, { foreignKey: 'userId' })
PropertyImage.belongsTo(PropertyListing, { foreignKey: 'propertyListingId' })
PropertyReview.belongsTo(PropertyListing, { foreignKey: 'propertyListingId' })

async function syncModels() {
    await User.sync()
    await UserProfile.sync()
    await PropertyListing.sync()
    await PropertyImage.sync()
    await PropertyReview.sync()
}

module.exports = {
    syncModels
}