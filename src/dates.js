import moment from 'moment'

function freeDays(text, done) {
  const holidays = JSON.parse(text)
    .map(function(day) {
      return {
        from: moment(day).toDate(),
        to: moment(day).toDate(),
        days: 1
      }
    })

  const today = moment()
  const weekends = []
  for (let i = 0; i < 365; i += 1) {
    if (today.day() === 0 || today.day() === 6) {
      weekends.push({
        from: today.format('YYYY-MM-DD'),
        to: today.format('YYYY-MM-DD'),
        days: 1
      })
    }

    today.add(1, 'days')
  }

  done(null, holidays.concat(weekends))
}

export default {
  freeDays
}
