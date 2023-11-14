const Sequelize = require('sequelize')
const sequelize = require('../connection')

const Client = sequelize.define('client', {
    name: Sequelize.STRING
})

const Hole = require('./Hole')
Client.hasMany(Hole)

module.exports = Client
