/**复制到剪贴板 */
export function copy(txt: string) {
    return new Promise<void>(resolve => {
        const textString = txt.toString()
        const textarea = document.createElement('textarea')
        textarea.readOnly = true // 防止ios聚焦触发键盘事件
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)

        textarea.value = textString
        // ios必须先选中文字且不支持 input.select();
        selectText(textarea, 0, textString.length)
        if (document.execCommand('copy')) {
            document.execCommand('copy')
            message.success('复制成功')
        }
        document.body.removeChild(textarea)
        resolve()

        // 选中文本
        function selectText(textbox: HTMLTextAreaElement, startIndex: number, stopIndex: number) {
            // @ts-ignore
            if (textbox.createTextRange) {
                //ie
                // @ts-ignore
                const range = textbox.createTextRange()
                range.collapse(true)
                range.moveStart('character', startIndex) //起始光标
                range.moveEnd('character', stopIndex - startIndex) //结束光标
                range.select() //不兼容苹果
            } else {
                //firefox/chrome
                textbox.setSelectionRange(startIndex, stopIndex)
                textbox.focus()
            }
        }
    })
}