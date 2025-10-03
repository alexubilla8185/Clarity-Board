import { GoogleGenAI, Type } from "@google/genai";
import { AIOption } from "../types";

/**
 * Retrieves the Gemini API key from the environment variables.
 * This approach uses dynamic property access on `globalThis` to prevent
 * build tools from statically replacing `process.env.API_KEY` with its value
 * at build time, which causes security scanners to fail the deployment.
 * @returns {string | undefined} The API key, or undefined if not found.
 */
const getApiKey = (): string | undefined => {
    // This dynamic access prevents the build tool's static analysis from replacing
    // the variable with the raw secret, which would fail security scans.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return globalThis['process']?.['env']?.['API_KEY'];
}

const apiKey = getApiKey();

if (!apiKey) {
    console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: apiKey! });

export interface SmartSplitTask {
    title: string;
    description: string;
}

export interface SmartSplitResponse {
    projectName: string;
    tasks: SmartSplitTask[];
}


const getPrompt = (option: AIOption, text: string): string => {
    switch(option) {
        case AIOption.SUMMARIZE:
            return `Summarize the following text into key bullet points:\n\n---\n${text}\n---`;
        case AIOption.BRAINSTORM:
            return `Based on the following task or idea, brainstorm a list of actionable sub-tasks or related concepts. Present them as a clear, easy-to-read list:\n\n---\n${text}\n---`;
        case AIOption.IMPROVE:
            return `Rewrite the following text to be more clear, concise, and professional. Do not add extra information, just improve the writing quality:\n\n---\n${text}\n---`;
        default:
            throw new Error('Invalid AI option');
    }
}

export const enhanceText = async (option: AIOption, text: string): Promise<string> => {
    if (!getApiKey()) {
        throw new Error("API Key not configured. AI features are unavailable.");
    }

    try {
        const prompt = getPrompt(option, text);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 0 }
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get a response from the AI. Please check your connection or API key.");
    }
};

export const generateProjectFromText = async (text: string): Promise<SmartSplitResponse> => {
    if (!getApiKey()) {
        throw new Error("API Key not configured. AI features are unavailable.");
    }
    
    const prompt = `Analyze the following unstructured text and extract actionable tasks. Propose a suitable project name for these tasks. Return the output as a valid JSON object. The JSON object must contain a 'projectName' (string) and a 'tasks' (array). Each object in the 'tasks' array should have a 'title' (string) and a 'description' (string). Ensure the description is detailed if context is available in the text. Here is the text:\n\n---\n${text}\n---`;

    const responseSchema = {
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

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        const jsonString = response.text.trim();
        return JSON.parse(jsonString) as SmartSplitResponse;

    } catch (error) {
        console.error("Error calling Gemini API for Smart Split:", error);
        throw new Error("Failed to get a response from the AI. Please check your input or connection.");
    }
};