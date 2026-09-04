#!/usr/bin/env node
// يُولّد بطاقة AppStream من قالبها، ويملأ رقم الإصدار من package.json وحده.
//
// package.json هو المصدر الوحيد للرقم في هذا المشروع، فلا يُكتَب في القالب حرفيّاً
// وإلّا تفرّق الرقم بين الحزمة والبطاقة عند أوّل إصدار يُنسى فيه.
//
// يُشغَّل ضمن `npm run build`، وهو ما تُنفّذه الآليّة قبل التحزيم.

const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const version = require(path.join(root, 'package.json')).version
const source = path.join(root, 'packaging', 'org.gnutux.gmd.metainfo.xml.in')
const target = path.join(root, 'packaging', 'org.gnutux.gmd.metainfo.xml')

// تاريخ الإصدار: تاريخ اليوم بصيغة ISO التي يطلبها AppStream
const date = new Date().toISOString().slice(0, 10)

const xml = fs.readFileSync(source, 'utf8')
  .replace(/@VERSION@/g, version)
  .replace(/@DATE@/g, date)

fs.mkdirSync(path.dirname(target), { recursive: true })
fs.writeFileSync(target, xml)
console.log(`metainfo: ${path.basename(target)} v${version} (${date})`)
