import { Kbd, KbdGroup } from "../../components/ui/kbd"

export default function KbdDemo() {
  return (
    <dl className="mx-auto grid max-w-xs gap-3 rounded-lg border bg-card p-4 text-sm">
      <div className="flex items-center justify-between gap-4">
        <dt>搜索组件</dt>
        <dd>
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </dd>
      </div>
      <div className="flex items-center justify-between gap-4">
        <dt>关闭浮层</dt>
        <dd>
          <Kbd>Esc</Kbd>
        </dd>
      </div>
      <div className="flex items-center justify-between gap-4">
        <dt>确认选择</dt>
        <dd>
          <Kbd>Enter</Kbd>
        </dd>
      </div>
    </dl>
  )
}
