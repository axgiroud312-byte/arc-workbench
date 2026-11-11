import { useState } from "react"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../../components/ui/input-otp"

export default function InputOTPDemo() {
  const [code, setCode] = useState("")
  return (
    <div className="flex flex-col items-center gap-3">
      <label htmlFor="verify-code" className="text-sm font-medium">
        输入六位验证码
      </label>
      <InputOTP
        id="verify-code"
        length={6}
        value={code}
        onValueChange={setCode}
      >
        <InputOTPGroup>
          {[0, 1, 2].map((index) => (
            <InputOTPSlot
              key={index}
              aria-label={"第 " + (index + 1) + " 位数字"}
            />
          ))}
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          {[3, 4, 5].map((index) => (
            <InputOTPSlot
              key={index}
              aria-label={"第 " + (index + 1) + " 位数字"}
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <p className="text-xs text-muted-foreground" role="status">
        {code.length === 6
          ? "已输入完整验证码"
          : "已输入 " + code.length + " / 6 位"}
      </p>
    </div>
  )
}
