import { lazy, type ComponentType } from "react"
import {
  blockCatalog,
  installationExample,
  installRoot,
  librarySections,
} from "./library/catalog"
import { foundationCatalog } from "./library/foundation"

const modules = import.meta.glob<Record<string, ComponentType>>(
  "./components/blocks/**/*.tsx"
)
const sources = import.meta.glob<string>(
  [
    "./components/blocks/**/*.tsx",
    "./components/ui/*.tsx",
    "./library/foundation/*.tsx",
  ],
  {
    query: "?raw",
    import: "default",
  }
)
const businessPreviews = blockCatalog.map((entry) => {
  const path = "./" + entry.location + ".tsx"
  return {
    ...entry,
    installId: entry.id,
    Component: lazy(async () => {
      if (!modules[path]) throw new Error("Missing component: " + path)
      const module = await modules[path]()
      if (!module[entry.previewExport])
        throw new Error("Missing export: " + entry.previewExport)
      return { default: module[entry.previewExport] }
    }),
    loadCode: async () => ({
      source: await sources[path](),
      usage: installationExample(entry),
    }),
  }
})

const foundationModules = import.meta.glob<{ default: ComponentType }>(
  "./library/foundation/*.tsx"
)
const foundationPreviews = Object.keys(librarySections).flatMap((section) =>
  foundationCatalog
    .filter((entry) => entry.section === section)
    .map((entry) => {
      const path = "./" + entry.location + ".tsx"
      const demoPath = "./" + entry.previewLocation + ".tsx"
      return {
        ...entry,
        Component: lazy(foundationModules[demoPath]),
        loadCode: async () => {
          const [source, usage] = await Promise.all([
            sources[path](),
            sources[demoPath](),
          ])
          return {
            source,
            usage: usage.replaceAll(
              "../../components/ui/",
              installRoot + "/components/ui/"
            ),
          }
        },
      }
    })
)

export const blocks = [...businessPreviews, ...foundationPreviews]
export type BlockDefinition = (typeof blocks)[number]
