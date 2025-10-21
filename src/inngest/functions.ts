import { inngest } from "./client";
import { generateText } from "ai";
import { groq } from '@ai-sdk/groq';

export const execute = inngest.createFunction(
    { id: "test-ai" },
    { event: "execute-ai" },
    async ({ event, step }) => {
        await step.sleep("pretend", "5s");

        const { steps: llama_steps } = await step.ai.wrap(
            "groq-generate-text",
            generateText,
            {
                model: groq("llama3-70b-8192"),
                system: "you are a helpful assistant",
                prompt: "what is led zepplin?"
            }
        );

        const { steps: openai_steps } = await step.ai.wrap(
            "groq-generate-text",
            generateText,
            {
                model: groq("openai/gpt-oss-120b"),
                system: "you are a helpful assistant",
                prompt: "who is Jimmy Page?"
            }
        );

        return step;

    }
);