import React from "react"

function makeTitle(text) {
  return text && text.length > 0 ? `${text} - Prose` : "Prose"
}

export default function Base({ title, children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <title>{makeTitle(title)}</title>
        <meta name="description" content="well said, well written, well read" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css?family=Lora:400,400i,700,700i" rel="stylesheet" />
        <link href="/static/app.css" rel="stylesheet" />
      </head>
      { children }
    </html>
  )
}
