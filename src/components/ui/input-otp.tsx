"use client"

import * as React from "react"
import { OTPField } from "@base-ui/react"
import { cn } from "cn"
import { MinusIcon } from "lucide-react"

function InputOTP({ className, ...props }: OTPField.Root.Props) {
  return (
    <OTPField.Root
      data-slot="input-otp"
      className={cn(
        "flex items-center gap-2 data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn(
        "flex items-center rounded-lg has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

function InputOTPSlot({ className, ...props }: OTPField.Input.Props) {
  return (
    <OTPField.Input
      data-slot="input-otp-slot"
      spellCheck={false}
      className={cn(
        "relative size-8 border-y border-r border-input bg-background text-center text-sm outline-none first:rounded-l-lg first:border-l last:rounded-r-lg focus:z-10 focus:border-ring focus:ring-3 focus:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30",
        className
      )}
      {...props}
    />
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      className="flex items-center [&_svg:not([class*='size-'])]:size-4"
      aria-hidden="true"
      {...props}
    >
      <MinusIcon />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
