import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "../../components/ui/combobox"

const projects = ["Arc Workbench", "前端组件库", "评测工具", "产品文档"]

export default function ComboboxDemo() {
  return (
    <div className="mx-auto grid w-full max-w-xs gap-1.5">
      <label htmlFor="project-select" className="text-sm font-medium">
        项目
      </label>
      <Combobox items={projects}>
        <ComboboxInput
          id="project-select"
          placeholder="搜索或选择项目"
          showClear
        />
        <ComboboxContent>
          <ComboboxEmpty>没有匹配的项目。</ComboboxEmpty>
          <ComboboxList>
            {(project: string) => (
              <ComboboxItem key={project} value={project}>
                {project}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
