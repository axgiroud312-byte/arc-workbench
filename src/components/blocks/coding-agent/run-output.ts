import type { RunArtifact, RunOutputs } from "./run-record"
import type { TestRun } from "./test-results"

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

export function runReport({
  path,
  ...report
}: Omit<RunArtifact, "source"> & { path: string }): RunOutputs {
  const { id, title, summary, items = [] } = report
  const source = [
    "# " + title,
    summary,
    ...items.map(({ label, value }) => "- **" + label + "** " + value),
  ]
    .filter(Boolean)
    .join("\n\n")

  const srcDoc = `<!doctype html>
<html lang="zh-CN">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
  :root { color-scheme: light dark; font: 14px/1.6 system-ui, sans-serif }
  body { margin: 0; padding: clamp(16px, 5vw, 32px); background: Canvas; color: CanvasText }
  h1 { font-size: clamp(20px, 5vw, 28px); line-height: 1.3; margin: 0 0 8px }
  p { margin: 0 0 14px; opacity: .8 }
  dl { margin: 0; border-block: 1px solid color-mix(in srgb, CanvasText 18%, Canvas) }
  dl div { display: grid; grid-template-columns: minmax(5rem, 2fr) 3fr; gap: 8px; padding: 8px 0 }
  dl div + div { border-top: 1px solid color-mix(in srgb, CanvasText 12%, Canvas) }
  dt { font-weight: 500 }
  dd { margin: 0; overflow-wrap: anywhere }
</style>
<main>
<h1>${escapeHtml(title)}</h1>
${summary ? "<p>" + escapeHtml(summary) + "</p>" : ""}
<dl>${items.map(({ label, value }) => "<div><dt>" + escapeHtml(label) + "</dt><dd>" + escapeHtml(value) + "</dd></div>").join("")}</dl>
</main>
</html>`

  return {
    pages: [{ id, title, path, srcDoc }],
    artifacts: [{ ...report, source }],
  }
}

export function testRunOutput(run: TestRun, filename = "regression-report.md") {
  const cases = run.suites.flatMap((suite) => suite.tests)
  const failed = cases.filter((test) => test.failure).length
  return runReport({
    id: "report-" + run.id,
    path: "/checks/" + run.id,
    title: run.title,
    filename,
    summary:
      cases.length -
      failed +
      " 项通过" +
      (failed ? "，" + failed + " 项失败。" : "。"),
    items: cases.map(({ title, failure }) => ({
      label: title,
      value: failure ?? "通过",
    })),
  })
}
