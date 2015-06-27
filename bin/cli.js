#!/usr/bin/env node

var program = require('commander')
var moment = require('moment')
var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var destinations = require('../lib/destinations')
var dates = require('../lib/dates')
var recommender = require('../lib/recommender')

program
  .version('1.0.0')

program
  .command('recommend <dates>')
  .action(function(dates) {

    if (!dates) {
      return console.error('Provide a dates file')
    }

    fs.readFile(path.resolve(dates), {encoding: 'utf8'}, function(err, data) {
      if (err) {
        return console.error('Cannot read from file: ' + dates)
      }

      const engine = recommender({
        dates: JSON.parse(data),
        lastVacation: moment(),
        vacationDays: 25,
        blockedWork: [
          {
            from: '2015-06-28',
            to: '2015-06-30',
            days: 3
          }
        ],
        blockedVac: [
          {
            from: '2015-07-03',
            to: '2015-07-13',
            days: 2
          }
        ]
      })

      const scores = engine.scores()
      console.log(engine.blocks(scores))
    })
  })

program
  .command('dates <file> <dir>')
  .action(function(file, dir) {
    if (!file) {
      return console.error('Provide a holidays file')
    }

    if (!dir) {
      return console.error('Provide an output directory')
    }

    fs.readFile(path.resolve(file), {encoding: 'utf8'}, function(err, data) {
      if (err) {
        return console.error('Cannot read from file: ' + file)
      }

      dates.freeDays(data, function(err, obj) {
        if (err) {
          return console.error(err.message)
        }

        fs.writeFile(
          path.resolve(dir, 'dates.json'),
          JSON.stringify(obj),
          {encoding: 'utf8'},
          function(err) {
            if (err) {
              return console.error('Cannot write JSON file')
            }

            console.log('Dates file created')
          }
        )
      })
    })
  })

program
  .command('destinations <file> <dir>')
  .action(function(file, dir) {
    if (!file) {
      return console.error('Provide a CSV file')
    }

    if (!dir) {
      return console.error('Provide an output directory')
    }

    fs.readFile(path.resolve(file), {encoding: 'utf8'}, function(err, data) {
      if (err) {
        return console.error('Cannot read from file: ' + file)
      }

      destinations.csvToJSON(data, function(err, obj) {
        if (err) {
          return console.error(err.message)
        }

        mkdirp(path.resolve(dir), function(err) {
          if (err) {
            return console.error('Cannot create output directory')
          }

          fs.writeFile(
            path.resolve(dir, 'destinations.json'),
            JSON.stringify(obj),
            {encoding: 'utf8'},
            function(err) {
              if (err) {
                return console.error('Cannot write JSON file')
              }

              console.log('Destinations file created')
            })
        })
      })
    })

  })

program.parse(process.argv)
