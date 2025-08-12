import { useState, useEffect } from 'react'

export function useVietnameseTranslation(text: string, isComplete: boolean) {
  const [translation, setTranslation] = useState<string>('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!text || !isComplete || isTranslating || translation) {
      return
    }

    const translateText = async () => {
      setIsTranslating(true)
      setError(null)
      
      try {
        console.log('Calling translation API for text length:', text.length)
        
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: text.trim() }),
        })

        if (!response.ok) {
          throw new Error(`Translation failed: ${response.status}`)
        }

        const data = await response.json()
        console.log('Translation API response:', data)
        
        setTranslation(data.translatedText)
      } catch (err) {
        console.error('Translation error:', err)
        setError(err instanceof Error ? err.message : 'Translation failed')
      } finally {
        setIsTranslating(false)
      }
    }

    // Small delay to ensure the response is fully rendered
    const timeoutId = setTimeout(translateText, 500)
    
    return () => clearTimeout(timeoutId)
  }, [text, isComplete, isTranslating, translation])

  return { translation, isTranslating, error }
}