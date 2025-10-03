import { AIOption } from "../types";

export interface SmartSplitTask {
    title: string;
    description: string;
}

export interface SmartSplitResponse {
    projectName: string;
    tasks: SmartSplitTask[];
}

const PROXY_ENDPOINT = '/.netlify/functions/gemini-proxy';

/**
 * A generic fetch wrapper to call our secure Netlify function proxy.
 * @param type - The type of AI operation to perform ('enhanceText' or 'generateProject').
 * @param payload - The data required for the operation.
 * @returns The JSON response from the proxy.
 */
async function callApiProxy<T>(type: string, payload: unknown): Promise<T> {
    try {
        const response = await fetch(PROXY_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type, payload }),
        });

        const responseData = await response.json();

        if (!response.ok) {
            // Use the error message from the proxy if available, otherwise use a generic message.
            throw new Error(responseData.error || `Request failed with status ${response.status}`);
        }

        return responseData;
    } catch (error) {
        console.error(`Error calling proxy for type ${type}:`, error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("An unexpected error occurred while contacting the AI service.");
    }
}

export const enhanceText = async (option: AIOption, text: string): Promise<string> => {
    // The proxy for enhanceText wraps the result in a { result: "..." } object
    const response = await callApiProxy<{ result: string }>('enhanceText', { option, text });
    return response.result;
};

export const generateProjectFromText = async (text: string): Promise<SmartSplitResponse> => {
    // The proxy for generateProject returns the SmartSplitResponse object directly
    return await callApiProxy<SmartSplitResponse>('generateProject', { text });
};