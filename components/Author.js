import React from "react"
import { renderToStaticMarkup } from "react-dom/server"

import Base from "./Base"

function Author({ data, content }) {
  return (
    <Base title={data.title}>
      <body className="author">
        <h1>{data.title}</h1>
      </body>
    </Base>
  )
}

function url(obj) {
  return `author/${obj.slug}`
}

function renderer(DB) {
  return Object.values(DB.authors).map(author => {
    let filtered = Object.values(DB.content).filter(obj => obj.author === author)
    return {
      file: renderToStaticMarkup(<Author data={author} content={filtered} />),
      path: author.url
    }
  })
}

export default {
  component: Author,
  url,
  renderer
}
