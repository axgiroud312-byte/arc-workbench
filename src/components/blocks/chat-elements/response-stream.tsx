"use client"

import { useEffect, useMemo, useState } from "react"

import { Button } from "../../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"

type ResponseStreamProps = {
  text: string
  playing?: boolean
  chunkSize?: number
  tickMs?: number
  onComplete?: () => void
}

export function ResponseStream(props: ResponseStreamProps) {
  return <ResponsePlayback key={props.text} {...props} />
}

function ResponsePlayback({
  text,
  playing = true,
  chunkSize = 3,
  tickMs = 48,
  onComplete,
}: ResponseStreamProps) {
  const segments = useMemo(
    () =>
      Array.from(
        new Intl.Segmenter("zh", { granularity: "grapheme" }).segment(text),
        ({ segment }) => segment
      ),
    [text]
  )
  const [cursor, setCursor] = useState(0)
  const finished = cursor >= segments.length

  useEffect(() => {
    if (!playing || finished) return
    const timer = window.setTimeout(
      () => {
        const next = Math.min(
          cursor + Math.max(1, Math.floor(chunkSize)),
          segments.length
        )
        setCursor(next)
        if (next === segments.length) onComplete?.()
      },
      Math.max(16, tickMs)
    )
    return () => window.clearTimeout(timer)
  }, [
    playing,
    finished,
    cursor,
    segments.length,
    chunkSize,
    tickMs,
    onComplete,
  ])

  return (
    <p
      className="min-h-14 text-sm leading-7 whitespace-pre-wrap"
      aria-busy={playing && !finished}
    >
      {segments.slice(0, cursor).join("")}
      {playing && !finished && (
        <span
          aria-hidden="true"
          className="ml-0.5 inline-block size-1.5 animate-pulse rounded-full bg-primary align-middle motion-reduce:animate-none"
        />
      )}
    </p>
  )
}

const sample =
  "我先核对了按钮在保存前后的状态，再用键盘和鼠标分别走了一遍提交。\n\n现在保存成功后会显示确认提示。遇到网络错误时，已经填写的内容会保留，用户可以直接重试。"

export function ResponseStreamDemo() {
  const [state, setState] = useState<"ready" | "playing" | "paused" | "done">(
    "ready"
  )
  const [playback, setPlayback] = useState(0)
  const playing = state === "playing"
  return (
    <Card className="mx-auto w-full max-w-lg gap-3">
      <CardHeader>
        <CardTitle>Agent 回复</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="min-h-28 rounded-lg border bg-muted/30 p-3">
          {state === "ready" ? (
            <p className="text-sm text-muted-foreground">
              点击播放，查看回复逐段出现。
            </p>
          ) : (
            <ResponseStream
              key={playback}
              text={sample}
              playing={playing}
              onComplete={() => setState("done")}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={state === "done"}
            onClick={() => setState(playing ? "paused" : "playing")}
          >
            {playing ? "暂停" : state === "paused" ? "继续" : "播放"}
          </Button>
          {state !== "ready" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPlayback((current) => current + 1)
                setState("playing")
              }}
            >
              重新播放
            </Button>
          )}
          <span className="ml-auto text-xs text-muted-foreground" role="status">
            {
              {
                ready: "等待播放",
                playing: "播放中",
                paused: "已暂停",
                done: "播放完成",
              }[state]
            }
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
