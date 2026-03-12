const fs = require("fs");

const office = "I10";
const school = "9300181";

const key = process.env.NEIS_KEY;

function getKoreanDateParts() {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  const parts = formatter.formatToParts(now);
  const year = parts.find(p => p.type === "year").value;
  const month = parts.find(p => p.type === "month").value;
  const day = parts.find(p => p.type === "day").value;

  return { year, month, day };
}

const { year, month, day } = getKoreanDateParts();
const todayYMD = `${year}${month}${day}`;

async function run() {
  const url =
    `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${key}&Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=${office}&SD_SCHUL_CODE=${school}&MLSV_FROM_YMD=${todayYMD}&MLSV_TO_YMD=${todayYMD}`;

  const res = await fetch(url);
  const json = await res.json();

  const rows = json?.mealServiceDietInfo?.[1]?.row || [];

  function clean(text) {
    return text
      .replace(/\([^\)]*\)/g, "")
      .replace(/<br\/?>/g, "<br>");
  }

  const breakfast = rows.find(r => r.MMEAL_SC_NM === "조식");
  const lunch = rows.find(r => r.MMEAL_SC_NM === "중식");
  const dinner = rows.find(r => r.MMEAL_SC_NM === "석식");

  const output = {
    date: `${year}년 ${Number(month)}월 ${Number(day)}일`,
    breakfast: breakfast ? clean(breakfast.DDISH_NM) : "-",
    lunch: lunch ? clean(lunch.DDISH_NM) : "-",
    dinner: dinner ? clean(dinner.DDISH_NM) : "-"
  };

  fs.writeFileSync("meal-sasa.json", JSON.stringify(output, null, 2));
}

run();
