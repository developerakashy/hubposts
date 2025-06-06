function getNextPostTime(intervalValue, intervalUnit) {
  const now = new Date();
  let ms = 0;

  switch (intervalUnit) {
    case 'hourly':
      ms = intervalValue * 60 * 60 * 1000;
      break;
    case 'daily':
      ms = intervalValue * 24 * 60 * 60 * 1000;
      break;
    default:
      ms = 24 * 60 * 60 * 1000; // fallback to 1 day
  }

  return new Date(now.getTime() + ms);
}

module.exports = { getNextPostTime }
