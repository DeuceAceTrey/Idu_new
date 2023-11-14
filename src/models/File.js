const Sequelize = require('sequelize')
const sequelize = require('../connection')

const File = sequelize.define('file', {
    name: Sequelize.STRING,
    url: Sequelize.STRING,
    size: Sequelize.INTEGER,
    type: Sequelize.STRING,
    viewed: Sequelize.BOOLEAN,
    holeId: Sequelize.INTEGER
})

module.exports = File
