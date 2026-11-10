import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"

export function PreviewCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex min-w-0 flex-col gap-4">
        {children}
      </CardContent>
    </Card>
  )
}
