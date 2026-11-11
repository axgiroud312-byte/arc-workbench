import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "../../components/ui/drawer"

export default function DrawerDemo() {
  return (
    <div className="flex justify-center">
      <Drawer>
        <DrawerTrigger className="rounded-md border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted">
          查看运行详情
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto grid max-w-md gap-4 pb-3">
            <div className="grid gap-1">
              <DrawerTitle>运行详情</DrawerTitle>
              <DrawerDescription>本次文件检查已完成。</DrawerDescription>
            </div>
            <dl className="grid grid-cols-2 gap-4 rounded-lg border p-4">
              <div>
                <dt className="text-muted-foreground">检查文件</dt>
                <dd className="mt-1 font-mono">12</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">用时</dt>
                <dd className="mt-1 font-mono">18 秒</dd>
              </div>
            </dl>
            <DrawerClose className="justify-self-end rounded-md border px-3 py-1.5 font-medium hover:bg-muted">
              完成
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
