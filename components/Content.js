import React from "react"
import marked from "marked"
import { renderToStaticMarkup } from "react-dom/server"

import Base from "./Base"

function Content({ data }) {
  return (
    <Base title={data.title}>
      <body className="content">
        <div className="title">
          <h1>{data.title}</h1>
        </div>
        <div className="body" dangerouslySetInnerHTML={{ __html: marked(data.body) }} />
      </body>
    </Base>
  )
}

function url(obj) {
  return `content/${obj.slug}`
}

function renderer(DB) {
  return Object.values(DB.content).map(content => ({
    file: renderToStaticMarkup(<Content data={content} />),
    path: content.url
  }))
}

export default {
  component: Content,
  url,
  renderer
}
