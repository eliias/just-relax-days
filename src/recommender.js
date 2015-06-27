import moment from 'moment'

// distance to time
const FACTOR_TIME_DISTANCE = 0.0005
function factorTimeDistance(last, day) {
  const diff = Math.max(0, day.diff(last, 'days'))
  const f = Math.pow(diff, 1.1)
  return Math.max(0.99, Math.min(1, FACTOR_TIME_DISTANCE * f))
}

// blocked for work
const FACTOR_BLOCKED_WORK = -1000
function factorBlocked(blockedDays, day) {
  return blockedDays.has(day.format('YYYY-MM-DD')) ? FACTOR_BLOCKED_WORK : 0
}

// blocked for vacation
const FACTOR_BLOCKED_VACATION = 200
function factorVacation(blockedVac, day) {
  return blockedVac.has(day.format('YYYY-MM-DD')) ? FACTOR_BLOCKED_VACATION : 0
}

// free day
const FACTOR_FREE_DAY = 90
function factorFreeDay(dates, day) {
  let score = 0

  // 2x2 free day search
  for (let i = -2; i < 2; i += 1) {
    const d = moment(day).add(i, 'days')
    if (dates.has(d.format('YYYY-MM-DD'))) {
      score += Math.min(FACTOR_FREE_DAY, 10 / Math.pow(Math.abs(i), 2))
    }
  }

  return score
}

export default function recommender(spec) {
  const {dates} = spec
  const {lastVacation} = spec
  const {vacationDays} = spec
  const {blockedWork} = spec
  const {blockedVac} = spec

  // dates to set
  function datesToSet(list) {
    const days = new Set()
    list.forEach(function(date) {
      const d = moment(date.from)
      for (let i = 0; i < date.days; i += 1) {
        days.add(d.add(1, 'days').format('YYYY-MM-DD'))
      }
    })

    return days
  }

  function max(a) {
    let maxStartIndex = 0
    let maxEndIndex = 0
    let maxSum = Number.MIN_VALUE

    let cumulativeSum = 0
    let maxStartIndexUntilNow = 0

    for (let index = 0; index < a.length; index += 1) {
      let eachArrayItem = a[index].score - 50

      cumulativeSum += eachArrayItem

      if (cumulativeSum > maxSum) {
        maxSum = cumulativeSum
        maxStartIndex = maxStartIndexUntilNow
        maxEndIndex = index
        continue
      }

      if (cumulativeSum < 0) {
        maxStartIndexUntilNow = index + 1
        cumulativeSum = 0
      }
    }

    return {
      score: maxSum + 50 * (maxEndIndex - maxStartIndex),
      diff: maxEndIndex - maxStartIndex + 1,
      start: maxStartIndex,
      end: maxEndIndex
    }

  }

  function blocks(scores) {
    const list = []
    for (let i = 0; i < 10; i += 1) {
      const block = max(scores)
      const dates = scores.splice(block.start, block.end - block.start + 1)
      block.start = dates[0]
      block.end = dates[dates.length - 1]
      list.push(block)
    }

    return list.sort(function(a, b) {
      if (a.score > b.score) {
        return -1
      }
      if (b.score > a.score) {
        return 1
      }
      return 0
    })
  }

  function scores() {
    let days = []
    const now = moment()
    const freeDays = datesToSet(dates)
    const blockedDays = datesToSet(blockedWork)
    const vacationDays = datesToSet(blockedVac)

    for (let i = 0; i < 365; i += 1) {
      const d = moment(now).add(i, 'days')

      days.push({
        date: d.format('YYYY-MM-DD'),
        free: freeDays.has(d.format('YYYY-MM-DD')),
        score: 1
      })
    }

    // distance to time
    days.forEach(function(day) {
      day.score += factorTimeDistance(lastVacation, moment(day.date))
    })

    // blocked
    days.forEach(function(day) {
      day.score += factorBlocked(blockedDays, moment(day.date))
    })

    // vacation
    days.forEach(function(day) {
      day.score += factorVacation(vacationDays, moment(day.date))
    })

    // free days
    days.forEach(function(day) {
      day.score += factorFreeDay(freeDays, moment(day.date))
    })

    // normalize
    days.forEach(function(day) {
      day.score = day.score
    })

    return days
  }

  return Object.freeze({
    blocks,
    scores
  })
}
