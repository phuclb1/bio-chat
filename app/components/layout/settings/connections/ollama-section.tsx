"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toast"
import { useState } from "react"

export function OllamaSection() {
  const [ollamaEndpoint, setOllamaEndpoint] = useState("http://localhost:11434")
  const [enableOllama, setEnableOllama] = useState(true) // Default enabled in dev
  const [isLoading, setIsLoading] = useState(false)

  // Ollama is now enabled by default in all environments unless DISABLE_OLLAMA=true
  const isLocked = false

  const testConnection = async () => {
    if (!ollamaEndpoint) return

    setIsLoading(true)
    try {
      const response = await fetch(`${ollamaEndpoint}/api/tags`)
      if (response.ok) {
        toast({
          title: "Ollama connection successful",
          description: "You can now use Ollama to run models locally.",
        })
      } else {
        toast({
          title: "Ollama connection failed",
          description: "Please check your Ollama endpoint and try again.",
        })
      }
    } catch {
      toast({
        title: "Ollama connection failed",
        description: "Please check your Ollama endpoint and try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-lg font-medium">Local Model Settings</h3>
        <p className="text-muted-foreground text-sm">
          Configure your local Ollama instance for running models locally.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ollama</span>
            <Switch
              checked={enableOllama}
              onCheckedChange={setEnableOllama}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ollama-endpoint">Endpoint</Label>
            <Input
              id="ollama-endpoint"
              type="url"
              placeholder="http://localhost:11434"
              value={ollamaEndpoint}
              onChange={(e) => setOllamaEndpoint(e.target.value)}
              disabled={!enableOllama}
            />
            <p className="text-muted-foreground mt-1 text-xs">
              Default Ollama endpoint. Make sure Ollama is running locally.
            </p>
          </div>

          {enableOllama && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={testConnection}
                disabled={isLoading || !ollamaEndpoint}
              >
                {isLoading ? "Testing..." : "Test Connection"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
