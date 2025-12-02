export const getDateStrings = (): {
  today: string;
  tomorrow: string;
  yesterday: string;
} => {
  const today = new Date();
  const todayStr = getDateFormat(today);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = getDateFormat(tomorrow);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getDateFormat(yesterday);
  return { today: todayStr, tomorrow: tomorrowStr, yesterday: yesterdayStr };
};

export const getWeddingDateStrings = (
  weddingDateStr: string
): {
  weddingDateStr: string;
  dayBeforeWeddingStr: string;
  dayAfterWeddingStr: string;
} => {
  const weddingDate = new Date(weddingDateStr);

  const dayBeforeWedding = new Date(weddingDate);
  dayBeforeWedding.setDate(dayBeforeWedding.getDate() - 1);
  const dayBeforeWeddingStr = getDateFormat(dayBeforeWedding);

  const dayAfterWedding = new Date(weddingDate);
  dayAfterWedding.setDate(dayAfterWedding.getDate() + 1);
  const dayAfterWeddingStr = getDateFormat(dayAfterWedding);
  return { weddingDateStr, dayBeforeWeddingStr, dayAfterWeddingStr };
};

export const getDateFormat = (date: Date): string => {
  return date.toISOString().split("T")[0];
};
