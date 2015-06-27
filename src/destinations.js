import _ from 'lodash'
import csv from 'csv'
import moment from 'moment'

const countries = new Set(['Austria', 'Germany', 'United States'])
const destinationTypes = [
  'city',
  'countryside',
  'sea',
  'mountain',
  'shit'
]

function whitelist(row) {
  const name = row[2]
  return countries.has(name)
}

function seasons() {
  const num = Math.round(Math.random() * 3)
  const list = []
  for (let i = 0; i < num; i += 1) {
    const from = moment().add(Math.round(Math.random() * 365), 'days')
    const to = moment(from).add(Math.max(30, Math.round(Math.random() * 60)), 'days')

    list.push({
      from: from.toDate(),
      to: to.toDate(),
      days: to.diff(from, 'days')
    })
  }

  return list
}

function types() {
  const num = Math.max(1, Math.round(Math.random() * destinationTypes.length - 1))
  return _.shuffle(destinationTypes).slice(0, num)
}

function csvToJSON(text, done) {
  csv.parse(text, {delimiter: ';'}, function(err, data) {
    if (err) {
      return done(err)
    }

    const result = data
      .filter(whitelist)
      .map(function(row) {
        return {
          name: row[2],
          types: types(),
          season: seasons()
        }
      })

    done(null, result)
  })
}

export default {
  csvToJSON
}
