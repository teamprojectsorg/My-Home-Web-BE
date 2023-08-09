const User = require('./User')
const UserProfile = require('./UserProfile')
const PropertyListing = require('./PropertyListing')
const PropertyImage = require('./PropertyImage')
const PropertyReview = require('./PropertyReview')

UserProfile.hasMany(PropertyListing, { foreignKey: 'userId', onDelete: 'RESTRICT' })
UserProfile.hasMany(PropertyReview, { foreignKey: 'userId', onDelete: 'RESTRICT' })
PropertyListing.hasMany(PropertyImage, { foreignKey: 'propertyListingId', onDelete: 'RESTRICT' })
PropertyListing.hasMany(PropertyReview, { foreignKey: 'propertyListingId', onDelete: 'RESTRICT'})

PropertyListing.belongsTo(UserProfile, { foreignKey: 'userId' })
PropertyReview.belongsTo(UserProfile, { foreignKey: 'userId' })
PropertyImage.belongsTo(PropertyListing, { foreignKey: 'propertyListingId' })
PropertyReview.belongsTo(PropertyListing, { foreignKey: 'propertyListingId' })

UserProfile.beforeDestroy((user) => {
    console.log('profile deleting')
    PropertyListing.destroy({ where: { userId: user.get({ plain: true }).userId }, individualHooks: true })
})
PropertyListing.beforeDestroy((listing) => {
    console.log('listing deleting')
    PropertyReview.destroy({ where: { propertyListingId: listing.get({ plain: true }).id }, individualHooks: true })
    PropertyImage.destroy({ where: { propertyListingId: listing.get({ plain: true }).id }, individualHooks: true })
})

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