const fs = require('fs')
const parsecsv = require('csv-parse/lib/sync')
const { spawnSync } = require('child_process')

// Add flag into trnTranslations
spawnSync('sqlite3', ["latest.sqlite", `
  ALTER TABLE trnTranslations ADD flag BOOL
  `])
spawnSync('sqlite3', ["latest.sqlite", `
  UPDATE trntranslations SET flag=0;
  UPDATE trntranslations SET flag=1 WHERE tcID IN (8,33) AND keyID IN (SELECT typeID FROM invTypes WHERE published=1);
  `])

// Export trnTranslations from database
const child = spawnSync('sqlite3', ["-csv", "latest.sqlite", `
  SELECT E.tcID,E.flag,E.text,Z.text
    FROM trnTranslations E JOIN trnTranslations Z
      ON Z.tcID=E.tcID AND Z.keyID=E.keyID
     AND (E.languageID='en' OR E.languageID='EN-US')
     AND (Z.languageID='zh' OR Z.languageID='ZH')
  `],
  { encoding: 'utf8' })
const origin = parsecsv(child.stdout, {
  auto_parse: true,
  columns: ['tcid', 'flag', 'en', 'zh']
})

// Filter & Convert translations
const EXCLUDE_TCID = [10,12,16,29,33,37,47,64,1001]
const lnkptr = new RegExp('<a .+?>(.+?)</a>', 'g')
const result = new Object()
for (let {tcid, flag, en, zh} of origin) {
  if (EXCLUDE_TCID.includes(tcid)) continue
  if (en.length === 0 || zh.length === 0 || en == zh) continue
  if (en.startsWith('#')) continue
  if (en.includes('\n') || zh.includes('\n')) continue

  en = en.replace(lnkptr, '$1').trim()
  zh = zh.replace(lnkptr, '$1').trim()
  if (en.includes('Blueprint') || en.includes('SKIN'))
    flag = 0

  const key = `${en}\t${zh}`
  result[key] = result[key] || flag
}

const result2 = new Array()
for (const k in result) {
  const v = result[k] === 1 ? 1 : 0
  result2.push(`${k}\t${v}`)
}

// Save
result2.sort()
fs.writeFileSync('src/trn.txt', result2.join('\n'))
