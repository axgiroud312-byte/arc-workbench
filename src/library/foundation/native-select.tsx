import { useState } from "react"
import {
  NativeSelect,
  NativeSelectOption,
} from "../../components/ui/native-select"

const languages = ["简体中文", "English", "日本語"]

export default function NativeSelectDemo() {
  const [language, setLanguage] = useState(languages[0])
  return (
    <div className="mx-auto grid max-w-xs gap-2">
      <label htmlFor="interface-language" className="text-sm font-medium">
        界面语言
      </label>
      <NativeSelect
        id="interface-language"
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
      >
        {languages.map((name) => (
          <NativeSelectOption key={name} value={name}>
            {name}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <p className="text-xs text-muted-foreground" role="status">
        当前选择 {language}
      </p>
    </div>
  )
}
