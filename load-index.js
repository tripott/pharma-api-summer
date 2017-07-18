require('dotenv').config()

const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'))

const db = new PouchDB(process.env.COUCHDB_URL + process.env.COUCHDB_NAME)

db
  .createIndex({
    index: { fields: ['type'] }
  })
  .then(() => console.log("created Index on the 'type' property"))
  .catch(err => console.log(err))

db
  .createIndex({
    index: { fields: ['form'] }
  })
  .then(() => console.log("created Index on the 'form' property"))
  .catch(err => console.log(err))
