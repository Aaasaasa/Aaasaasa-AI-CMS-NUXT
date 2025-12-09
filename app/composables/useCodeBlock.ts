export const useCodeBlock = () => {
  // Syntax Highlighting mit Prism.js
  const highlightCode = async (element: HTMLElement) => {
    if (import.meta.client && window.Prism) {
      try {
        window.Prism.highlightAllUnder(element)
      } catch {
        // Syntax highlighting fehlgeschlagen
      }
    }
  }

  // Copy-to-Clipboard Funktionalität
  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        return true
      } else {
        // Fallback für ältere Browser
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        const success = document.execCommand('copy')
        textArea.remove()
        return success
      }
    } catch {
      return false
    }
  }

  // Code-Block Setup mit Copy-Button
  const setupCodeBlocks = (container: HTMLElement | Document = document) => {
    const codeBlocks = container.querySelectorAll('pre')

    codeBlocks.forEach((pre) => {
      // Language Detection
      const code = pre.querySelector('code')
      if (code && code.className) {
        const langMatch = code.className.match(/language-(\w+)/)
        if (langMatch && langMatch[1]) {
          pre.setAttribute('data-lang', langMatch[1])
        }
      }

      // Prism.js Syntax Highlighting anwenden
      if (import.meta.client && window.Prism) {
        try {
          window.Prism.highlightElement(code || pre)
        } catch {
          // Highlighting fehlgeschlagen
        }
      }

      // Copy-Button hinzufügen (falls nicht vorhanden)
      if (!pre.querySelector('.copy-button')) {
        const copyButton = document.createElement('button')
        copyButton.className = 'copy-button'
        copyButton.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>Kopieren</span>
        `
        copyButton.setAttribute('title', 'Code kopieren')

        copyButton.addEventListener('click', async () => {
          const codeText = pre.textContent || ''
          const success = await copyToClipboard(codeText)

          if (success) {
            copyButton.classList.add('copied')
            copyButton.innerHTML = `
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6L9 17l-5-5"></path>
              </svg>
              <span>Kopiert!</span>
            `

            setTimeout(() => {
              copyButton.classList.remove('copied')
              copyButton.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>Kopieren</span>
              `
            }, 2000)
          }
        })

        pre.style.position = 'relative'
        pre.appendChild(copyButton)
      }
    })
  }

  // Line Numbers Funktionalität
  const addLineNumbers = (container: HTMLElement | Document = document) => {
    const codeBlocks = container.querySelectorAll('pre code')

    codeBlocks.forEach((code) => {
      const pre = code.parentElement
      if (!pre || pre.querySelector('.line-numbers')) return

      const lines = code.textContent?.split('\n') || []
      if (lines.length <= 1) return

      const lineNumbersDiv = document.createElement('div')
      lineNumbersDiv.className = 'line-numbers'
      lineNumbersDiv.style.cssText = `
        position: absolute;
        left: 0;
        top: 1.5rem;
        padding: 0 0.75rem;
        color: #6b7280;
        font-size: 0.75rem;
        line-height: 1.6;
        user-select: none;
        border-right: 1px solid #374151;
        background-color: #111827;
      `

      lines.forEach((_, index) => {
        const lineNumber = document.createElement('div')
        lineNumber.textContent = (index + 1).toString()
        lineNumbersDiv.appendChild(lineNumber)
      })

      pre.appendChild(lineNumbersDiv)
      pre.style.paddingLeft = '3rem'
    })
  }

  return {
    highlightCode,
    copyToClipboard,
    setupCodeBlocks,
    addLineNumbers
  }
}
