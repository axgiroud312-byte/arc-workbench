import { lazy, type ComponentType } from "react"
import { blockCatalog, installationExample } from "./library/catalog"

const modules = import.meta.glob<Record<string, ComponentType>>(
  "./components/blocks/**/*.tsx"
)
const sources = import.meta.glob<string>("./components/blocks/**/*.tsx", {
  query: "?raw",
  import: "default",
})
export const blocks = blockCatalog.map((entry) => {
  const path = "./" + entry.location + ".tsx"
  return {
    ...entry,
    Component: lazy(async () => {
      if (!modules[path]) throw new Error("Missing component: " + path)
      const module = await modules[path]()
      if (!module[entry.previewExport])
        throw new Error("Missing export: " + entry.previewExport)
      return { default: module[entry.previewExport] }
    }),
    source: async () => (sources[path] ? sources[path]() : ""),
    usage: installationExample(entry),
  }
})
export type BlockDefinition = (typeof blocks)[number]
