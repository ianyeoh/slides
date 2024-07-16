import React from 'react'
import { useState } from 'react'
import detectLang from 'lang-detector'
import CodeEditor from '@uiw/react-textarea-code-editor'
export default function CodeTextarea({
  code,
  setCode,
  isDisabled,
  style
}: {
  code: string
  setCode: React.Dispatch<React.SetStateAction<string>>
  isDisabled: boolean
  style: React.CSSProperties
}) {
  const [language, setLanguage] = useState((detectLang(code) as string).toLowerCase())

  const handleBlur = () => {
    let l = (detectLang(code) as string).toLowerCase()
    if (l === 'unknown') {
      l = 'javascript'
    }
    setLanguage(l)
  }

  return (
    <CodeEditor
      disabled={isDisabled}
      value={code}
      language={language}
      placeholder="Please enter code."
      onChange={(evn) => setCode(evn.target.value)}
      onBlur={handleBlur}
      padding={15}
      className="disable-drag h-full w-full bg-[#f5f5f5] leading-relaxed"
      style={style}
    />
  )
}
