import { readFile, writeFile } from "fs"
import { parse as parsePath, join as joinPath } from "path"
import glob from "glob"
import Promise from "bluebird"
import { safeLoad } from "js-yaml"
import mkdirp from "mkdirp"

import config from "./config"

Promise.onPossiblyUnhandledRejection(err => { throw err })

const readFileAsync = Promise.promisify(readFile)
const writeFileAsync = Promise.promisify(writeFile)
const mkdirpAsync = Promise.promisify(mkdirp)

const frontMatterRegExp = /---([\s\S]*?)---/

// For the time being, the location of refernces is hard-coded.
// This will be used later when fields that contain references are unknown
// const referenceRegExp = /\(([\w\-]+\s?)+\)/g
// const referenceRegExp = /\(([a-z\-]+\s?)+\)/g

const parsers = {

  markdown(str) {
    let obj = {}
    let front = str.match(frontMatterRegExp)
    if (front) {
      Object.assign(obj, safeLoad(front[1]))
      obj.body = str.replace(front[0], "").trim()
    } else {
      obj.body = str.trim()
    }
    return obj
  },

  yaml(str) {
    return safeLoad(str)
  }

}

function getFilename(f) {
  return parsePath(f).name
}

function initDB() {
  let DB = {}
  let work = []
  config.db.forEach((obj) => {
    DB[obj.name] = {}
    let files = glob.sync(obj.glob).map(f =>
      readFileAsync(f, { encoding: "utf8" })
        .then(parsers[obj.processAs])
        .then(data => {
          data.slug = getFilename(f)
          data.url = obj.url(data)
          DB[obj.name][data.slug] = data
        })
    )
    work = work.concat(files)
  })
  return Promise.all(work).then(() => DB)
}

function resolveReferences(DB) {
  config.db.forEach((obj) => {
    if (!obj.refs) { return }
    Object.keys(DB[obj.name]).forEach((slug) => {
      let curr = DB[obj.name][slug]
      obj.refs.forEach((ref) => {
        let foreignKey = curr[ref.key]
        if (foreignKey) {
          curr[ref.key] = DB[ref.from][foreignKey]
        }
      })
    })
  })
  return DB
}

function render(DB) {
  return config.renderers.reduce((all, func) => (
    all.concat(func(DB))
  ), [])
}

function prepareFile(str) {
  return "<!doctype html>" + str
}

function saveToDisk(arr) {
  return Promise.all(arr.map((obj) => {
    let fullPath = joinPath("./", config.output, obj.path)
    return mkdirpAsync(fullPath)
      .then(() => writeFileAsync(joinPath(fullPath, "index.html"), prepareFile(obj.file)))
  }))
}

initDB()
  .then(resolveReferences)
  .then(render)
  .then(saveToDisk)
  .then(() => { console.log("Done!") })
