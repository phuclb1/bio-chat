import { translateToVietnamese } from "@/lib/translation"

export async function POST(req: Request) {
  try {
    const { text } = await req.json()

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400 }
      )
    }

    console.log("Translation API called with text length:", text.length)
    
    const translatedText = await translateToVietnamese(text)
    
    return new Response(
      JSON.stringify({ 
        translatedText,
        originalLength: text.length,
        translatedLength: translatedText.length 
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error("Translation API error:", error)
    return new Response(
      JSON.stringify({ error: "Translation failed", details: error.message }),
      { status: 500 }
    )
  }
}