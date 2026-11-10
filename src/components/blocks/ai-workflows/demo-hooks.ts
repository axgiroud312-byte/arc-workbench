import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "../../ui/toast"

export function useTextReveal() {
  const [text, setText] = useState("")
  const [running, setRunning] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current)
    timer.current = null
    setRunning(false)
  }, [])
  useEffect(() => () => { if (timer.current) clearInterval(timer.current) }, [])
  const start = useCallback((value: string) => {
    stop()
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(value)
      return
    }
    setText("")
    setRunning(true)
    const isChinese = /[\u3400-\u9fff]/.test(value)
    const words = isChinese ? Array.from(value) : value.split(" ")
    let count = 0
    timer.current = setInterval(() => {
      count += 3
      setText(words.slice(0, count).join(isChinese ? "" : " "))
      if (count >= words.length) stop()
    }, 65)
  }, [stop])
  const reset = useCallback(() => { stop(); setText("") }, [stop])
  return { text, running, start, stop, reset }
}

export function useLocalProgress(duration = 2600) {
  const [progress, setProgress] = useState(0)
  const [running, setRunning] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const stop = useCallback(() => { if (timer.current) clearInterval(timer.current); timer.current = null; setRunning(false) }, [])
  useEffect(() => () => { if (timer.current) clearInterval(timer.current) }, [])
  const start = useCallback(() => {
    stop(); setProgress(0); setRunning(true)
    const began = Date.now()
    timer.current = setInterval(() => {
      const next = Math.min(100, (Date.now() - began) / duration * 100)
      setProgress(next)
      if (next >= 100) stop()
    }, 80)
  }, [duration, stop])
  const reset = useCallback(() => { stop(); setProgress(0) }, [stop])
  return { progress, running, start, stop, reset, complete: progress >= 100 }
}

export async function copyDemoText(text: string) {
  try { await navigator.clipboard.writeText(text); toast.add({ title: "已复制到剪贴板", type: "success" }) }
  catch { toast.add({ title: "无法访问剪贴板，请选中文字后手动复制。", type: "error" }) }
}
