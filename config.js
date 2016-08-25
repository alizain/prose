import author from "./components/Author"
import content from "./components/Content"

export default {
  output: "docs",
  db: [
    {
      name: "authors",
      glob: "./data/authors/**/*.yaml",
      processAs: "yaml",
      url: author.url
    },
    {
      name: "content",
      glob: "./data/content/**/*.md",
      processAs: "markdown",
      refs: [
        { key: "author", from: "authors" }
      ],
      self: {
        inherit: true,
        parent: "source",
        child: "children"
      },
      url: content.url
    }
  ],
  renderers: [
    author.renderer,
    content.renderer
  ]
}
