"use client"

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer"
import { cn } from "cn"

function Drawer({
  swipeDirection = "down",
  ...props
}: DrawerPrimitive.Root.Props) {
  return <DrawerPrimitive.Root swipeDirection={swipeDirection} {...props} />
}

const DrawerTrigger = DrawerPrimitive.Trigger
const DrawerClose = DrawerPrimitive.Close

function DrawerContent({
  className,
  children,
  ...props
}: DrawerPrimitive.Popup.Props) {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/35 transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0" />
      <DrawerPrimitive.Viewport className="pointer-events-none fixed inset-0 z-50">
        <DrawerPrimitive.Popup
          data-slot="drawer-content"
          className={cn(
            "pointer-events-auto absolute flex max-h-[90dvh] flex-col overflow-hidden border bg-popover text-sm text-popover-foreground shadow-lg transition-transform duration-200 outline-none data-swiping:transition-none",
            "translate-x-(--drawer-swipe-movement-x) translate-y-[calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y,0px))]",
            "data-[swipe-direction=down]:inset-x-0 data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:rounded-t-xl data-[swipe-direction=down]:data-ending-style:translate-y-full data-[swipe-direction=down]:data-starting-style:translate-y-full",
            "data-[swipe-direction=up]:inset-x-0 data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:rounded-b-xl data-[swipe-direction=up]:data-ending-style:-translate-y-full data-[swipe-direction=up]:data-starting-style:-translate-y-full",
            "data-[swipe-direction=left]:inset-y-0 data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:max-h-none data-[swipe-direction=left]:w-[min(24rem,90vw)] data-[swipe-direction=left]:data-ending-style:-translate-x-full data-[swipe-direction=left]:data-starting-style:-translate-x-full",
            "data-[swipe-direction=right]:inset-y-0 data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:max-h-none data-[swipe-direction=right]:w-[min(24rem,90vw)] data-[swipe-direction=right]:data-ending-style:translate-x-full data-[swipe-direction=right]:data-starting-style:translate-x-full",
            className
          )}
          {...props}
        >
          <div
            aria-hidden
            className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30 in-data-[swipe-direction=left]:hidden in-data-[swipe-direction=right]:hidden in-data-[swipe-direction=up]:hidden"
          />
          <DrawerPrimitive.Content className="min-h-0 overflow-y-auto p-4">
            {children}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPrimitive.Portal>
  )
}

function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
  return (
    <DrawerPrimitive.Title
      className={cn("text-base font-medium", className)}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: DrawerPrimitive.Description.Props) {
  return (
    <DrawerPrimitive.Description
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
}
