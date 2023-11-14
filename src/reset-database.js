// const sequelize = require('./connection')

// const { clients } = require('../fixtures.json')
// const { createAdmin, createHole, createClient } = require('./actions')

// sequelize.sync({ force: true }).then(() => {
//     Promise.all([
//         createAdmin('root', 'Dcubed!!'),
//         createAdmin('s', 'p'),
//         createAdmin('j', 'p'),
//         // ...clients.map(createClient),
//     ]).then(() => {
//         sequelize.close()
//         console.log('Done')
//     })
// })

console.warn("Database reset script disabled. Too dangerous.");
