import { Typography } from "../../components/ui/typography"

export default function TypographyDemo() {
  return (
    <article className="mx-auto grid max-w-md gap-4 rounded-lg border bg-card p-5">
      <Typography variant="h2">工作区变更</Typography>
      <Typography variant="lead">新的预览目录可以按组件类型查找。</Typography>
      <Typography>
        运行 <Typography variant="code">npm run dev</Typography>{" "}
        后，从左侧打开任意组件。
      </Typography>
      <Typography variant="blockquote">预览中的数据会在刷新后重置。</Typography>
      <Typography variant="ul">
        <li>切换桌面与手机尺寸</li>
        <li>复制安装命令和示例代码</li>
      </Typography>
    </article>
  )
}
