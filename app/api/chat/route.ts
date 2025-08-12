import { SYSTEM_PROMPT_DEFAULT } from "@/lib/config"
import { getAllModels } from "@/lib/models"
import { getProviderForModel } from "@/lib/openproviders/provider-map"
import type { ProviderWithoutOllama } from "@/lib/user-keys"
import { translateToEnglish, translateToVietnamese } from "@/lib/translation"
import { Attachment } from "@ai-sdk/ui-utils"
import { Message as MessageAISDK, streamText, ToolSet } from "ai"
import {
  incrementMessageCount,
  logUserMessage,
  storeAssistantMessage,
  validateAndTrackUsage,
} from "./api"
import { createErrorResponse, extractErrorMessage } from "./utils"

export const maxDuration = 60

type ChatRequest = {
  messages: MessageAISDK[]
  chatId: string
  userId: string
  model: string
  isAuthenticated: boolean
  systemPrompt: string
  enableSearch: boolean
  message_group_id?: string
}

export async function POST(req: Request) {
  try {
    const {
      messages,
      chatId,
      userId,
      model,
      isAuthenticated,
      systemPrompt,
      enableSearch,
      message_group_id,
    } = (await req.json()) as ChatRequest

    if (!messages || !chatId || !userId) {
      return new Response(
        JSON.stringify({ error: "Error, missing information" }),
        { status: 400 }
      )
    }

    const supabase = await validateAndTrackUsage({
      userId,
      model,
      isAuthenticated,
    })

    // Increment message count for successful validation
    if (supabase) {
      await incrementMessageCount({ supabase, userId })
    }

    const userMessage = messages[messages.length - 1]

    // Translate the user message to English if needed
    let processedMessages = messages
    if (userMessage?.role === "user" && typeof userMessage.content === "string") {
      try {
        console.log("message: " + userMessage.content)
        const translatedContent = await translateToEnglish(userMessage.content)
        if (translatedContent !== userMessage.content) {
          console.log("Translated user message from non-English to English")
          // Create a new messages array with the translated content
          processedMessages = [
            ...messages.slice(0, -1),
            {
              ...userMessage,
              content: translatedContent,
            }
          ]
        }
      } catch (error) {
        console.warn("Translation failed, continuing with original message:", error)
      }
    }

    if (supabase && userMessage?.role === "user") {
      await logUserMessage({
        supabase,
        userId,
        chatId,
        content: userMessage.content,
        attachments: userMessage.experimental_attachments as Attachment[],
        model,
        isAuthenticated,
        message_group_id,
      })
    }

    const allModels = await getAllModels()
    const modelConfig = allModels.find((m) => m.id === model)

    if (!modelConfig || !modelConfig.apiSdk) {
      throw new Error(`Model ${model} not found`)
    }

    const effectiveSystemPrompt = systemPrompt || SYSTEM_PROMPT_DEFAULT

    let apiKey: string | undefined
    if (isAuthenticated && userId) {
      const { getEffectiveApiKey } = await import("@/lib/user-keys")
      const provider = getProviderForModel(model)
      apiKey =
        (await getEffectiveApiKey(userId, provider as ProviderWithoutOllama)) ||
        undefined
    }

    // Variable to store the completed response for translation
    let completedResponse: string = ""

    const result = streamText({
      model: modelConfig.apiSdk(apiKey, { enableSearch }),
      system: effectiveSystemPrompt,
      messages: processedMessages,
      tools: {} as ToolSet,
      maxSteps: 10,
      onError: (err: unknown) => {
        console.error("Streaming error occurred:", err)
        // Don't set streamError anymore - let the AI SDK handle it through the stream
      },

      onFinish: async ({ response }) => {
        // Extract the completed response text for translation
        const lastMessage = response.messages[response.messages.length - 1]
        if (lastMessage?.role === 'assistant' && typeof lastMessage.content === 'string') {
          completedResponse = lastMessage.content
          console.log("Completed response captured for translation, length:", completedResponse.length)
          
          // Translate and store Vietnamese version
          try {
            const vietnameseContent = await translateToVietnamese(completedResponse)
            console.log("Vietnamese translation completed, length:", vietnameseContent.length)
            
            // Create a new message array with both English and Vietnamese
            const enhancedMessages = response.messages.map((msg: any, index: number) => {
              if (index === response.messages.length - 1 && msg.role === 'assistant') {
                return {
                  ...msg,
                  content: msg.content + '\n\n---\n\n**Bản dịch tiếng Việt:**\n\n' + vietnameseContent
                }
              }
              return msg
            })
            
            if (supabase) {
              await storeAssistantMessage({
                supabase,
                chatId,
                messages: enhancedMessages as unknown as import("@/app/types/api.types").Message[],
                message_group_id,
                model,
              })
            }
          } catch (error) {
            console.warn("Failed to translate for storage:", error)
            // Store original message if translation fails
            if (supabase) {
              await storeAssistantMessage({
                supabase,
                chatId,
                messages: response.messages as unknown as import("@/app/types/api.types").Message[],
                message_group_id,
                model,
              })
            }
          }
        } else {
          // Store original if no content to translate
          if (supabase) {
            await storeAssistantMessage({
              supabase,
              chatId,
              messages: response.messages as unknown as import("@/app/types/api.types").Message[],
              message_group_id,
              model,
            })
          }
        }
      },
    })

    // For now, let's simplify and just return the original response
    // We'll add Vietnamese translation in a separate API call approach
    const customResult = result.toDataStreamResponse({
      sendReasoning: true,
      sendSources: true,
      getErrorMessage: (error: unknown) => {
        console.error("Error forwarded to client:", error)
        return extractErrorMessage(error)
      },
    })

    // TODO: Implement Vietnamese translation using a different approach
    // The streaming approach is complex - we could add it as a follow-up API call
    console.log("Returning original response - translation will be added later")
    
    return customResult
  } catch (err: unknown) {
    console.error("Error in /api/chat:", err)
    const error = err as {
      code?: string
      message?: string
      statusCode?: number
    }

    return createErrorResponse(error)
  }
}
