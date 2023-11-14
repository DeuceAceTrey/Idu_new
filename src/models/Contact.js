const Sequelize = require('sequelize')
const sequelize = require('../connection')

const Contact = sequelize.define('contact', {
    name: Sequelize.STRING,
    email: Sequelize.STRING,
    role: Sequelize.STRING,
    password: Sequelize.STRING,
    salt: Sequelize.STRING,
    lastLoggedIn: Sequelize.DATE,
})

const Client = require('./Client')
Contact.belongsToMany(Client, { through: 'client_contact' })
Client.belongsToMany(Contact, { through: 'client_contact' })

module.exports = Contact
