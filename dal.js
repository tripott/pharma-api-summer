const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'))
const db = new PouchDB(process.env.COUCHDB_URL + process.env.COUCHDB_NAME)

function listMeds(limit, callback) {
  find(
    {
      selector: {
        type: 'medication'
      }
    },
    function(err, data) {
      if (err) return callback(err)
      callback(null, data.docs)
    }
  )
}

function find(query, cb) {
  console.log('query', JSON.stringify(query, null, 2))
  query ? db.find(query, cb) : cb(null, [])
}

const dal = {
  listMeds
}

module.exports = dal
