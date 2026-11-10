import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { registrySchema } from "shadcn/schema"
import ts from "typescript"
import {
  blockCatalog,
  installStyles,
  libraryKits,
  librarySections,
  registryHome,
} from "../src/library/catalog.ts"

const root = fileURLToPath(new URL("../", import.meta.url))
const manifest = JSON.parse(
  readFileSync(path.join(root, "package.json"), "utf8")
)
const projectDependencies = manifest.dependencies
const themeFile = "src/library/styles.css"
const filesByModule = new Map()
const brandNotes = ["LICENSE-lobehub.txt", "SOURCES.md", "sources.json"].map(
  (name) => "src/assets/brands/" + name
)
const docs = "在 Tailwind CSS 入口加入 " + installStyles
const foundation = readdirSync(path.join(root, "src/components/ui"))
  .filter((file) => file.endsWith(".tsx"))
  .sort()
  .map((file) => "src/components/ui/" + file)

function resolveLocal(file, specifier) {
  const base = path.posix.normalize(
    path.posix.join(path.posix.dirname(file), specifier)
  )
  const candidates = [
    base,
    base + ".ts",
    base + ".tsx",
    base + "/index.ts",
    base + "/index.tsx",
  ]
  const target = candidates.find((candidate) => {
    if (!candidate.startsWith("src/")) return false
    const absolute = path.join(root, candidate)
    return existsSync(absolute) && statSync(absolute).isFile()
  })
  if (!target) throw new Error(file + " 引用了找不到的库文件 " + specifier)
  return target
}

function importsFor(file) {
  if (filesByModule.has(file)) return filesByModule.get(file)
  const absolute = path.join(root, file)
  if (!existsSync(absolute)) throw new Error("缺少库文件 " + file)
  const source = readFileSync(absolute, "utf8")
  const imports = /\.(ts|tsx)$/.test(file)
    ? ts
        .preProcessFile(source, true, true)
        .importedFiles.map(({ fileName }) => fileName)
    : []
  filesByModule.set(file, imports)
  return imports
}

function closure(roots) {
  const files = new Set()
  const dependencies = new Set()

  function visit(file) {
    if (files.has(file)) return
    files.add(file)
    for (const specifier of importsFor(file)) {
      if (specifier.startsWith(".")) {
        visit(resolveLocal(file, specifier))
        continue
      }
      if (specifier.startsWith("@/") || specifier.startsWith("/")) {
        throw new Error(file + " 必须通过相对路径导入库文件 " + specifier)
      }
      const segments = specifier.split("/")
      const name = segments
        .slice(0, specifier.startsWith("@") ? 2 : 1)
        .join("/")
      if (name === "react" || name === "react-dom") continue
      const version = projectDependencies[name]
      if (!version) throw new Error(file + " 使用了未声明的 npm 依赖 " + name)
      dependencies.add(name + "@" + version)
    }
  }

  for (const file of [...roots, themeFile]) visit(file)
  if ([...files].some((file) => file.startsWith("src/assets/brands/"))) {
    for (const file of brandNotes) visit(file)
  }
  if ([...files].some((file) => file.startsWith("src/components/ui/"))) {
    visit("src/components/ui/LICENSE-shadcn.txt")
  }
  return {
    dependencies: [...dependencies].sort(),
    files: [...files].sort().map((file) => ({
      path: file,
      type:
        file.startsWith("src/components/ui/") && file.endsWith(".tsx")
          ? "registry:ui"
          : "registry:file",
      target: "@components/arc-workbench/" + file.slice("src/".length),
    })),
  }
}

function createItem(name, title, description, type, category, roots) {
  const sources = closure(roots)
  return {
    name,
    type,
    title,
    description,
    categories: [category],
    ...sources,
    docs,
  }
}

const kits = libraryKits.map((kit) =>
  createItem(
    kit.id,
    kit.title,
    kit.description,
    "registry:item",
    "组合套件",
    kit.entry ? [kit.entry] : foundation
  )
)
const blocks = Object.keys(librarySections).flatMap((section) =>
  blockCatalog
    .filter((item) => item.section === section)
    .map((item) =>
      createItem(
        item.id,
        item.name,
        item.description,
        "registry:block",
        librarySections[item.section],
        [item.path]
      )
    )
)
const primitives = foundation.map((file) => {
  const name = path.posix.basename(file, ".tsx")
  return createItem(
    "ui/" + name,
    name,
    "Arc Workbench 使用的 Base UI 基础组件。",
    "registry:ui",
    "Base UI 基础组件",
    [file]
  )
})
const items = [...kits, ...blocks, ...primitives]
if (new Set(items.map(({ name }) => name)).size !== items.length)
  throw new Error("安装清单存在重复名称")

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "arc-workbench",
  homepage: registryHome,
  items,
}
registrySchema.parse(registry)
const output = JSON.stringify(registry, null, 2) + "\n"
const target = path.join(root, "registry.json")
if (process.argv.includes("--check")) {
  if (
    !existsSync(target) ||
    readFileSync(target, "utf8").replace(/\r\n/g, "\n") !== output
  ) {
    throw new Error("安装清单需要更新。请运行 npm run registry:generate。")
  }
} else {
  writeFileSync(target, output)
}
console.log(
  items.length +
    " 个安装项 · " +
    blocks.length +
    " 个业务组件 · " +
    primitives.length +
    " 个基础组件 · " +
    kits.length +
    " 个组合包"
)
