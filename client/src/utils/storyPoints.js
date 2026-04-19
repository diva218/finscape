export function buildStoryPoints(monthlyBalances = [], events = []) {
  return monthlyBalances.map((balance, index) => {
    const month = index + 1;
    const affecting = events
      .filter((event) => {
        if (!event) return false;
        const eventMonth = Number(event.month) || 1;
        return event.recurring ? month >= eventMonth : month === eventMonth;
      })
      .map((event) => event.name)
      .filter(Boolean);

    return {
      month,
      balance,
      eventCause: affecting.length ? affecting.join(", ") : "None"
    };
  });
}
