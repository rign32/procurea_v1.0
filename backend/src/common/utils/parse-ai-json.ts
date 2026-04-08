/**
 * Robust JSON parser for AI model responses.
 * Handles markdown fences, partial responses, and common formatting issues.
 */
export function parseAiJson<T = any>(text: string): T {
    if (!text || typeof text !== 'string') {
        throw new Error('parseAiJson: empty or non-string input');
    }

    // 1. Try direct parse (fastest path)
    try {
        return JSON.parse(text);
    } catch {}

    // 2. Strip markdown fences (```json ... ```, ~~~json ... ~~~)
    const cleaned = text
        .replace(/^```(?:json|JSON)?\s*\n?/gm, '')
        .replace(/^~~~(?:json|JSON)?\s*\n?/gm, '')
        .replace(/^```\s*$/gm, '')
        .replace(/^~~~\s*$/gm, '')
        .trim();
    try {
        return JSON.parse(cleaned);
    } catch {}

    // 3. Extract first JSON object ({ ... }) by finding balanced braces
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
            return JSON.parse(text.substring(firstBrace, lastBrace + 1));
        } catch {}
    }

    // 4. Extract first JSON array ([ ... ]) if no object found
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket > firstBracket) {
        try {
            return JSON.parse(text.substring(firstBracket, lastBracket + 1));
        } catch {}
    }

    // 5. Throw with context for debugging
    throw new Error(
        `parseAiJson: failed to extract valid JSON. Input length: ${text.length}. First 300 chars: ${text.substring(0, 300)}`,
    );
}
