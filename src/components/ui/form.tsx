"use client"

import { Form as FormPrimitive } from "@base-ui/react/form"
import { Field as FieldPrimitive } from "@base-ui/react/field"
import { cn } from "cn"

const Form = FormPrimitive

function FormField({ className, ...props }: FieldPrimitive.Root.Props) {
  return (
    <FieldPrimitive.Root
      data-slot="form-field"
      className={cn("grid gap-1.5", className)}
      {...props}
    />
  )
}

function FormLabel({ className, ...props }: FieldPrimitive.Label.Props) {
  return (
    <FieldPrimitive.Label
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

function FormError({ className, ...props }: FieldPrimitive.Error.Props) {
  return (
    <FieldPrimitive.Error
      className={cn("text-xs text-destructive", className)}
      {...props}
    />
  )
}

const FormControl = FieldPrimitive.Control

export { Form, FormControl, FormError, FormField, FormLabel }
