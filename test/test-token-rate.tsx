import axios, { AxiosResponse } from 'axios';

// Define the response shape from Ollama's /api/generate endpoint
interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  total_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
}

// Configuration
const model: string = "rainscales-healthcare-ai/med-llm:8b";
const prompt: string = "How long does it take for newborn jaundice to go away?";
const url: string = "http://113.176.195.22:11435/api/generate";

async function testTokenRate(): Promise<void> {
  try {
    // Send request
    const response: AxiosResponse<OllamaResponse> = await axios.post(url, {
      model,
      prompt,
      stream: false,
    }, {
      headers: { 'Content-Type': 'application/json' },
    });

    // Parse response
    const data: OllamaResponse = response.data;
    const promptTokens: number = data.prompt_eval_count ?? 0;
    const promptDuration: number = (data.prompt_eval_duration ?? 0) / 1e9; // Convert ns to seconds
    const generationTokens: number = data.eval_count ?? 0;
    const generationDuration: number = (data.eval_duration ?? 0) / 1e9; // Convert ns to seconds

    // Calculate token rates
    const promptRate: number = promptDuration > 0 ? promptTokens / promptDuration : 0;
    const generationRate: number = generationDuration > 0 ? generationTokens / generationDuration : 0;

    // Print results
    console.log(`Model: ${model}`);
    console.log(`Prompt Tokens: ${promptTokens}`);
    console.log(`Prompt Duration: ${promptDuration.toFixed(3)} seconds`);
    console.log(`Prompt Token Rate: ${promptRate.toFixed(2)} tokens/second`);
    console.log(`Generation Tokens: ${generationTokens}`);
    console.log(`Generation Duration: ${generationDuration.toFixed(3)} seconds`);
    console.log(`Generation Token Rate: ${generationRate.toFixed(2)} tokens/second`);
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

// Run the function
testTokenRate();