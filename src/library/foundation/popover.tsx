import { Button } from "@base-ui/react/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "../../components/ui/popover"

export default function PopoverDemo() {
  return (
    <div className="flex justify-center">
      <Popover>
        <PopoverTrigger
          render={
            <Button className="rounded-md border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted" />
          }
        >
          查看运行概况
        </PopoverTrigger>
        <PopoverContent>
          <PopoverTitle>上次运行</PopoverTitle>
          <PopoverDescription>组件检查已通过。</PopoverDescription>
          <dl className="mt-1 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-xs">
            <dt>测试</dt>
            <dd className="font-mono">8 / 8</dd>
            <dt>用时</dt>
            <dd className="font-mono">18 秒</dd>
          </dl>
        </PopoverContent>
      </Popover>
    </div>
  )
}
