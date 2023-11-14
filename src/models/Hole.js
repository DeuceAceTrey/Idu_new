const Sequelize = require('sequelize')
const sequelize = require('../connection')

const Hole = sequelize.define('hole', {
    code: Sequelize.STRING,
})

const File = require('./File')
Hole.hasMany(File)

module.exports = Hole
