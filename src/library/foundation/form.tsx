import { useState } from "react"
import { Button } from "@base-ui/react/button"
import {
  Form,
  FormControl,
  FormError,
  FormField,
  FormLabel,
} from "../../components/ui/form"

export default function FormDemo() {
  const [project, setProject] = useState("")
  return (
    <Form<{ project: string }>
      onFormSubmit={(values) => setProject(values.project.trim())}
      className="mx-auto flex max-w-xs flex-col gap-3 rounded-lg border bg-card p-4"
    >
      <FormField
        name="project"
        validate={(value) =>
          typeof value === "string" && value.trim().length >= 2
            ? null
            : "请输入至少 2 个字符。"
        }
      >
        <FormLabel>项目名称</FormLabel>
        <FormControl
          autoComplete="off"
          placeholder="例如，组件工作台"
          className="h-8 rounded-md border bg-background px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive"
        />
        <FormError />
      </FormField>
      <Button
        type="submit"
        className="self-start rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
      >
        保存项目
      </Button>
      {project && (
        <p role="status" className="text-xs text-muted-foreground">
          已保存 {project}
        </p>
      )}
    </Form>
  )
}
