const fs = require("fs")

const office="I10"
const school="9300181"

const key=process.env.NEIS_KEY

function ymd(d){

const yyyy=d.getFullYear()
const mm=String(d.getMonth()+1).padStart(2,"0")
const dd=String(d.getDate()).padStart(2,"0")

return `${yyyy}${mm}${dd}`

}

const today=new Date()
const todayYMD=ymd(today)

async function run(){

const url=
`https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${key}&Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=${office}&SD_SCHUL_CODE=${school}&MLSV_FROM_YMD=${todayYMD}&MLSV_TO_YMD=${todayYMD}`

const res=await fetch(url)

const json=await res.json()

const rows=json?.mealServiceDietInfo?.[1]?.row||[]

function clean(text){

return text
.replace(/\([^\)]*\)/g,"")
.replace(/<br\/?>/g,"<br>")

}

const lunch=rows.find(r=>r.MMEAL_SC_NM==="중식")
const dinner=rows.find(r=>r.MMEAL_SC_NM==="석식")

const output={

date:`${today.getMonth()+1}/${today.getDate()}`,

lunch:lunch?clean(lunch.DDISH_NM):"-",
dinner:dinner?clean(dinner.DDISH_NM):"-"

}

fs.writeFileSync("meal-sasa.json",JSON.stringify(output,null,2))

}

run()
