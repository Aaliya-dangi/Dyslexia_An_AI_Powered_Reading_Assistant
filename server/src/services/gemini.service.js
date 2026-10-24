
/**
 * Fast NLP service for text simplification.
 *
 * Provider:
 *   Groq API
 *
 * Model:
 *   openai/gpt-oss-20b
 *
 * The API key remains on the server and is never exposed
 * to the React client.
 *
 * The model performs:
 *   - vocabulary simplification
 *   - sentence restructuring
 *   - difficult-word identification
 *   - simple definitions
 *   - simple replacements
 *
 * Local readability calculations are handled separately by
 * simplification.service.js.
 */

const GROQ_API_URL =
  'https://api.groq.com/openai/v1/chat/completions';

const GROQ_MODEL =
  process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

const VALID_LEVELS = new Set([
  'light',
  'moderate',
  'high'
]);

function getApiKey() {
  const key = process.env.GROQ_API_KEY;

  if (!key) {
    throw new Error(
      'GROQ_API_KEY is not configured in the server .env file.'
    );
  }

  return key;
}

/**
 * Instructions for each simplification intensity.
 */
function levelInstructions(level) {
  switch (level) {
    case 'light':
      return `
LIGHT SIMPLIFICATION:

- Make only small changes to the original passage.
- Preserve the original sentence structure whenever possible.
- Replace only clearly difficult, uncommon, or unnecessarily formal words.
- Prefer common everyday alternatives.
- Do not aggressively rewrite.
- Do not split sentences unless they are extremely long or difficult to follow.
- Preserve almost all original wording and detail.
`;

    case 'moderate':
      return `
MODERATE SIMPLIFICATION:

- Replace difficult, academic, or unnecessarily formal words with common words.
- Rewrite dense phrases into clearer everyday language.
- Split long or complicated sentences when this improves readability.
- Preserve all important facts and technical meaning.
- Keep essential technical terms.
- The result should be noticeably easier to read than the original.
`;

    case 'high':
      return `
HIGH SIMPLIFICATION:

- Rewrite the passage into very accessible everyday English.
- Prefer short and familiar words.
- Break long sentences into shorter sentences where useful.
- Aim for approximately 8–18 words per sentence when practical.
- Remove unnecessary sentence complexity.
- Explain difficult ideas using simpler wording without adding information.
- Preserve every important fact.
- Keep essential technical terms when necessary, but use simple surrounding language.
- The result should be substantially easier to read than the original.
`;

    default:
      throw new Error(
        `Invalid simplification level: ${level}. Expected light, moderate, or high.`
      );
  }
}

const responseSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    simplifiedText: {
      type: 'string'
    },

    difficultWords: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          word: {
            type: 'string'
          },

          originalWord: {
            type: 'string'
          },

          simplifiedWord: {
            type: 'string'
          },

          definition: {
            type: 'string'
          },

          synonyms: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        },

        required: [
          'word',
          'originalWord',
          'simplifiedWord',
          'definition',
          'synonyms'
        ]
      }
    }
  },

  required: [
    'simplifiedText',
    'difficultWords'
  ]
};

/**
 * Simplify text using Groq + GPT-OSS 20B.
 *
 * The function name is intentionally kept as
 * simplifyWithGemini so existing imports do not break.
 */
export async function simplifyWithGemini(
  rawText,
  level = 'moderate'
) {
  if (
    !rawText ||
    typeof rawText !== 'string' ||
    !rawText.trim()
  ) {
    throw new Error('Valid text content is required.');
  }

  if (!VALID_LEVELS.has(level)) {
    throw new Error(
      `Invalid simplification level: ${level}.`
    );
  }

  const apiKey = getApiKey();

  const prompt = `
You are the NLP engine of a dyslexia-friendly reading assistant.

Your task is to simplify an English passage for a reader who may
struggle with difficult vocabulary, long sentences, and dense
sentence structures.

The selected simplification intensity is:

${level.toUpperCase()}

${levelInstructions(level)}

GENERAL RULES:

1. Preserve the complete meaning of the original passage.

2. Preserve every important fact.

3. Do not add facts, examples, claims, explanations, or information
   that does not exist in the original passage.

4. Do not summarize.

5. Preserve paragraph boundaries.

6. Use exactly one blank line between paragraphs.

7. Prefer familiar everyday vocabulary.

8. Keep essential scientific, medical, technical, or domain-specific
   terms when changing them would make the meaning inaccurate.

9. difficultWords MUST contain words from the ORIGINAL passage.

10. Do not mark ordinary words as difficult simply to increase the list.

11. For every difficult word:
    - word = the original difficult word
    - originalWord = the same original word
    - simplifiedWord = the simpler replacement used in the
      simplified passage, if one exists
    - definition = a short plain-English definition
    - synonyms = useful simple alternatives

12. A difficult word may be retained if it is technically necessary.

13. If a word is retained, simplifiedWord may contain the retained word.

14. Do not include punctuation as part of a difficult word.

15. Do not include a word merely because it happens to be the final
    word of a sentence or paragraph.

16. The difficultWords list should normally contain meaningful
    vocabulary that could genuinely challenge a reader.

17. Return ONLY the requested JSON object.

ORIGINAL PASSAGE:

${rawText}
`;

  const controller = new AbortController();

  // 20 seconds is enough for this fast inference model.
  const timeout = setTimeout(() => {
    controller.abort();
  }, 20000);

  let response;

  try {
    response = await fetch(GROQ_API_URL, {
      method: 'POST',

      signal: controller.signal,

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },

      body: JSON.stringify({
        model: GROQ_MODEL,

        messages: [
          {
            role: 'system',
            content:
              'You are a precise NLP text simplification engine. ' +
              'Return only valid JSON matching the requested schema.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],

        temperature: 0.1,

        reasoning_effort: 'low',

        max_completion_tokens: 2500,

        response_format: {
          type: 'json_schema',

          json_schema: {
            name: 'dyslexia_simplification',

            strict: true,

            schema: responseSchema
          }
        }
      })
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(
        'NLP simplification timed out after 20 seconds. Please try a shorter passage.'
      );
    }

    throw new Error(
      `Unable to connect to Groq NLP service: ${error.message}`
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    let details = '';

    try {
      const errorBody = await response.json();

      details =
        errorBody?.error?.message ||
        errorBody?.message ||
        '';
    } catch {
      // Keep generic HTTP error.
    }

    throw new Error(
      `Groq NLP request failed (${response.status})` +
      `${details ? `: ${details}` : '.'}`
    );
  }

  const data = await response.json();

  const text =
    data?.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error(
      'Groq returned an empty simplification response.'
    );
  }

  let result;

  try {
    result = JSON.parse(text);
  } catch {
    throw new Error(
      'Groq returned invalid JSON for the simplification result.'
    );
  }

  if (
    !result.simplifiedText ||
    typeof result.simplifiedText !== 'string'
  ) {
    throw new Error(
      'Groq did not return valid simplified text.'
    );
  }

  return {
    simplifiedText:
      result.simplifiedText.trim(),

    difficultWords:
      Array.isArray(result.difficultWords)
        ? result.difficultWords
            .map((item) => ({
              word: String(
                item.originalWord ||
                item.word ||
                ''
              )
                .trim()
                .toLowerCase(),

              originalWord: String(
                item.originalWord ||
                item.word ||
                ''
              ).trim(),

              simplifiedWord: String(
                item.simplifiedWord ||
                ''
              ).trim(),

              syllables: [],

              definition: String(
                item.definition ||
                ''
              ).trim(),

              synonyms:
                Array.isArray(item.synonyms)
                  ? item.synonyms
                      .map(String)
                      .map(s => s.trim())
                      .filter(Boolean)
                  : [],

              frequency: 1
            }))
            .filter(item => item.word)
        : []
  };
}
