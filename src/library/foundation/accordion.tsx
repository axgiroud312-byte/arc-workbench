import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion"

export default function AccordionDemo() {
  return (
    <Accordion
      defaultValue={["install"]}
      className="mx-auto w-full max-w-sm rounded-lg border bg-card px-4"
    >
      <AccordionItem value="install">
        <AccordionTrigger>如何安装组件？</AccordionTrigger>
        <AccordionContent>
          复制组件页的安装命令，在你的 shadcn 项目中运行。
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="theme">
        <AccordionTrigger>支持深色模式吗？</AccordionTrigger>
        <AccordionContent>支持。组件会随项目的主题切换。</AccordionContent>
      </AccordionItem>
      <AccordionItem value="source">
        <AccordionTrigger>可以修改样式吗？</AccordionTrigger>
        <AccordionContent>
          可以。安装后，组件源码保存在你的项目中。
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
