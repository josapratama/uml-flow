/**
 * AI Assistant for generating UML diagrams from natural language descriptions.
 * This is a foundation/stub — requires an LLM API key to function.
 *
 * Usage: generateDiagramFromDescription("A user management system with login, roles, and permissions")
 * Returns: DSL code string that can be compiled into a diagram.
 */

const SYSTEM_PROMPT = `You are a UML diagram generator. Given a description, generate UML DSL code.
Use this format:
@diagram "Name" class

class ClassName {
  +attribute: type
  +method(param: type): returnType
}

ClassName1 --> ClassName2 : relationship

Only output the DSL code, nothing else.`;

/**
 * Generate UML DSL from a natural language description.
 * Requires OPENAI_API_KEY or similar LLM endpoint.
 * Falls back to a template if no API is available.
 */
export async function generateDiagramFromDescription(
  description: string,
  apiKey?: string,
  endpoint?: string,
): Promise<string> {
  // If API key provided, use LLM
  if (apiKey && endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: description },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });
      const data = await response.json();
      return (
        data.choices?.[0]?.message?.content || generateFallback(description)
      );
    } catch {
      return generateFallback(description);
    }
  }

  // Fallback: simple template-based generation
  return generateFallback(description);
}

/** Simple template-based diagram generation from keywords. */
function generateFallback(description: string): string {
  const words = description.toLowerCase().split(/\s+/);
  const entities: string[] = [];

  // Extract potential class names (capitalized words or common patterns)
  const namePattern = /\b([A-Z][a-z]+(?:[A-Z][a-z]+)*)\b/g;
  let match;
  const original = description;
  while ((match = namePattern.exec(original)) !== null) {
    if (!entities.includes(match[1])) entities.push(match[1]);
  }

  // Common domain keywords
  if (words.includes("user") && !entities.includes("User"))
    entities.push("User");
  if (words.includes("admin") && !entities.includes("Admin"))
    entities.push("Admin");
  if (words.includes("product") && !entities.includes("Product"))
    entities.push("Product");
  if (words.includes("order") && !entities.includes("Order"))
    entities.push("Order");
  if (words.includes("payment") && !entities.includes("Payment"))
    entities.push("Payment");
  if (words.includes("login") || words.includes("auth")) {
    if (!entities.includes("Auth")) entities.push("Auth");
  }

  if (entities.length === 0) entities.push("Entity1", "Entity2");

  let dsl = `@diagram "Generated" class\n\n`;
  for (const entity of entities) {
    dsl += `class ${entity} {\n  +id: string\n  +name: string\n}\n\n`;
  }

  // Add some relationships
  if (entities.length >= 2) {
    dsl += `${entities[0]} --> ${entities[1]} : association\n`;
  }

  return dsl;
}
