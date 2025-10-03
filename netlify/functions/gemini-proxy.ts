import { GoogleGenAI, Type } from "@google/genai";
import type { Handler, HandlerEvent } from "@netlify/functions";

// Enums and interfaces copied from src/types.ts for self-containment
enum AIOption {
    SUMMARIZE = 'SUMMARIZE',
    BRAINSTORM = 'BRAINSTORM',
    IMPROVE = 'IMPROVE',
}

// Helper functions copied from src/services/geminiService.ts
const getEnhanceTextPrompt = (option: AIOption, text: string): string => {
    switch(option) {
        case AIOption.SUMMARIZE:
            return `Summarize the following text into key bullet points:\n\n---\n${text}\n---`;
        case AIOption.BRAINSTORM:
            return `Based on the following task or idea, brainstorm a list of actionable sub-tasks or related concepts. Present them as a clear, easy-to-read list:\n\n---\n${text}\n---`;
        case AIOption.IMPROVE:
            return `Rewrite the following text to be more clear, concise, and professional. Do not add extra information, just improve the writing quality:\n\n---\n${text}\n---`;
        default:
            // This should not be reached if the frontend sends a valid option
            throw new Error('Invalid AI option provided.');
    }
};

const getGenerateProjectPrompt = (text: string): string => {
    return `Analyze the following unstructured text and extract actionable tasks. Propose a suitable project name for these tasks. Return the output as a valid JSON object. The JSON object must contain a 'projectName' (string) and a 'tasks' (array). Each object in the 'tasks' array should have a 'title' (string) and a 'description' (string). Ensure the description is detailed if context is available in the text. Here is the text:\n\n---\n${text}\n---`;
};

const generateProjectResponseSchema = {
    type: Type.OBJECT,
    properties: {
      projectName: {
        type: Type.STRING,
        description: "A concise name for the project based on the text."
      },
      tasks: {
        type: Type.ARRAY,
        description: "A list of actionable tasks extracted from the text.",
        items: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A short, clear title for the task."
            },
            description: {
              type: Type.STRING,
              description: "A detailed description of the task, if available in the text."
            }
          },
          required: ['title', 'description']
        }
      }
    },
    required: ['projectName', 'tasks']
};

const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY is not set in Netlify environment variables.');
        return { statusCode: 500, body: JSON.stringify({ error: 'The AI service is not configured on the server.' }) };
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
        const { type, payload } = JSON.parse(event.body || '{}');

        if (type === 'enhanceText') {
            const { option, text } = payload;
            const prompt = getEnhanceTextPrompt(option, text);
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { thinkingConfig: { thinkingBudget: 0 } }
            });

            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ result: response.text }),
            };
        } else if (type === 'generateProject') {
            const { text } = payload;
            const prompt = getGenerateProjectPrompt(text);
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: generateProjectResponseSchema,
                }
            });
            // The response.text from a JSON schema request is already a valid JSON string
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: response.text,
            };
        } else {
            return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request type specified.' }) };
        }
    } catch (error) {
        console.error('Error calling Gemini API in Netlify function:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `The AI service failed to process the request. Details: ${errorMessage}` }),
        };
    }
};

export { handler };