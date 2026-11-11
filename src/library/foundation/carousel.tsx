import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../components/ui/carousel"

const projects = [
  { name: "组件库", detail: "检查页面组件和主题样式" },
  { name: "编程工作台", detail: "验证 Agent 对话和执行记录" },
  { name: "评测套件", detail: "比较模型在同一组用例上的表现" },
]

export default function CarouselDemo() {
  return (
    <Carousel className="mx-auto w-full max-w-xs px-10" aria-label="示例项目">
      <CarouselContent>
        {projects.map(({ name, detail }) => (
          <CarouselItem key={name}>
            <div className="grid h-32 content-center gap-2 rounded-lg border bg-card p-4">
              <p className="font-medium">{name}</p>
              <p className="text-xs text-muted-foreground">{detail}</p>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-0" aria-label="上一个项目" />
      <CarouselNext className="right-0" aria-label="下一个项目" />
    </Carousel>
  )
}
