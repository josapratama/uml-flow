/**
 * AI Assistant for generating UML diagrams from natural language descriptions.
 * Supports all 9 diagram types with syntax-specific prompts, markdown fence cleaning,
 * and intelligent keyword-based fallbacks.
 */

const DIAGRAM_PROMPTS: Record<string, string> = {
  class: `You are an expert UML Class diagram generator.
Output valid UML DSL:
@diagram "Diagram Name" class

class User {
  +id: string
  -password: string
  +login(email: string, pass: string): boolean
}

interface Identifiable {
  +getId(): string
}

class Role {
  +name: string
}

User ..|> Identifiable
User --> Role : has`,

  sequence: `You are an expert UML Sequence diagram generator.
Output valid UML DSL:
@diagram "Auth Flow" sequence

participant Client as actor
participant Server as object
participant DB as entity

Client -> Server: login(user, pass)
Server -> DB: findUser(user)
DB -->> Server: userData
Server -->> Client: authToken`,

  activity: `You are an expert UML Activity diagram generator.
Output valid UML DSL:
@diagram "Process Flow" activity

[start]
action "Receive Request"
decision "Is Valid?"
[yes] action "Process Payment"
[no] action "Return Error"
action "Send Confirmation"
[end]`,

  flowchart: `You are an expert Flowchart generator.
Output valid UML DSL:
@diagram "Logic Flow" flowchart

start "Start"
process "Input Data"
decision "Verify?"
process "Save to DB"
end "Complete"`,

  erd: `You are an expert ERD database diagram generator.
Output valid UML DSL:
@diagram "E-Commerce DB" erd

entity User {
  *id: int
  name: varchar
  email: varchar [unique]
}

entity Order {
  *id: int
  user_id: int [fk]
  total: decimal
}

User ||--o{ Order : places`,

  state: `You are an expert UML State diagram generator.
Output valid UML DSL:
@diagram "Lifecycle" state

[initial]
state Idle
state Processing
state Completed
[initial] --> Idle
Idle --> Processing : start
Processing --> Completed : finish`,

  usecase: `You are an expert UML Use Case diagram generator.
Output valid UML DSL:
@diagram "System Use Cases" usecase

actor Customer
actor Admin
usecase "Browse Products"
usecase "Checkout"
usecase "Manage Stock"

Customer --> "Browse Products"
Customer --> "Checkout"
Admin --> "Manage Stock"`,

  component: `You are an expert UML Component diagram generator.
Output valid UML DSL:
@diagram "Architecture" component

component "Web App" <<client>>
component "API Gateway"
component "Auth Service"
component "Database" <<storage>>

"Web App" --> "API Gateway"
"API Gateway" --> "Auth Service"
"Auth Service" --> "Database"`,

  deployment: `You are an expert UML Deployment diagram generator.
Output valid UML DSL:
@diagram "Infrastructure" deployment

node "Client Machine" {
  device "Browser"
}
node "Cloud Server" {
  component "Web API"
  artifact "App.docker"
}
node "Database Cluster" {
  node "PostgreSQL"
}

"Browser" --> "Web API"
"Web API" --> "PostgreSQL"`,
};

function getSystemPrompt(diagramType?: string): string {
  const type = diagramType?.toLowerCase().trim();
  const specificGuide = (type && DIAGRAM_PROMPTS[type]) || DIAGRAM_PROMPTS.class;

  return `${specificGuide}

IMPORTANT RULES:
1. Always start with @diagram "Name" <type>.
2. Only output raw UML DSL code without any explanations, markdown code blocks, or backticks.`;
}

/**
 * Strips markdown code blocks (e.g. \`\`\`dsl ... \`\`\`) and trims leading chit-chat.
 */
export function stripMarkdownFences(raw: string): string {
  let cleaned = raw.trim();

  // If wrapped in ```...```
  const fenceMatch = cleaned.match(/^```(?:[a-zA-Z0-9_-]+)?\s*([\s\S]*?)\s*```$/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  } else if (cleaned.includes("```")) {
    const inside = cleaned.match(/```(?:[a-zA-Z0-9_-]+)?\s*(@diagram[\s\S]*?)\s*```/);
    if (inside) {
      cleaned = inside[1].trim();
    }
  }

  // If there is preamble before @diagram, cut it
  const diagramIdx = cleaned.indexOf("@diagram");
  if (diagramIdx > 0) {
    cleaned = cleaned.substring(diagramIdx).trim();
  }

  return cleaned;
}

/**
 * Generate UML DSL from a natural language description.
 */
export async function generateDiagramFromDescription(
  description: string,
  diagramType?: string,
  apiKey?: string,
  endpoint?: string,
  model?: string,
): Promise<string> {
  // If API key provided, call the LLM endpoint
  if (apiKey && endpoint) {
    const selectedModel = model?.trim() || "gpt-4o-mini";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: "system", content: getSystemPrompt(diagramType) },
          {
            role: "user",
            content: diagramType
              ? `Create a ${diagramType} diagram for: ${description}`
              : description,
          },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      let errMsg = `AI API Error (${response.status})`;
      try {
        const parsed = JSON.parse(errBody);
        if (parsed.error?.message) errMsg += `: ${parsed.error.message}`;
      } catch {
        if (errBody) errMsg += `: ${errBody.slice(0, 100)}`;
      }
      throw new Error(errMsg);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      return stripMarkdownFences(content);
    }
    throw new Error("No diagram content returned by AI provider");
  }

  // Fallback: smart keyword-based generation
  return generateFallback(description, diagramType);
}

/** Simple fallback diagram generation based on keywords and requested type. */
function generateFallback(description: string, requestedType?: string): string {
  const type = requestedType?.toLowerCase().trim() || "class";
  const words = description.toLowerCase().split(/\s+/);
  const entities: string[] = [];

  const namePattern = /\b([A-Z][a-z]+(?:[A-Z][a-z]+)*)\b/g;
  let match;
  while ((match = namePattern.exec(description)) !== null) {
    if (!entities.includes(match[1])) entities.push(match[1]);
  }

  if (words.includes("user") && !entities.includes("User")) entities.push("User");
  if (words.includes("admin") && !entities.includes("Admin")) entities.push("Admin");
  if (words.includes("product") && !entities.includes("Product")) entities.push("Product");
  if (words.includes("order") && !entities.includes("Order")) entities.push("Order");
  if (words.includes("payment") && !entities.includes("Payment")) entities.push("Payment");
  if (words.includes("auth") || words.includes("login")) {
    if (!entities.includes("Auth")) entities.push("Auth");
  }

  if (entities.length === 0) entities.push("MainService", "Database");

  if (type === "sequence") {
    let dsl = `@diagram "Generated Sequence" sequence\n\n`;
    for (const ent of entities) {
      dsl += `participant ${ent} as object\n`;
    }
    dsl += "\n";
    if (entities.length >= 2) {
      dsl += `${entities[0]} -> ${entities[1]}: process()\n`;
      dsl += `${entities[1]} -->> ${entities[0]}: result\n`;
    }
    return dsl;
  }

  if (type === "activity" || type === "flowchart") {
    let dsl = `@diagram "Generated Flow" ${type}\n\n`;
    if (type === "activity") {
      dsl += `[start]\n`;
      for (const ent of entities) dsl += `action "Process ${ent}"\n`;
      dsl += `[end]\n`;
    } else {
      dsl += `start "Start"\n`;
      for (const ent of entities) dsl += `process "Handle ${ent}"\n`;
      dsl += `end "End"\n`;
    }
    return dsl;
  }

  if (type === "erd") {
    let dsl = `@diagram "Generated ERD" erd\n\n`;
    for (const ent of entities) {
      dsl += `entity ${ent} {\n  *id: int\n  name: varchar\n}\n\n`;
    }
    if (entities.length >= 2) {
      dsl += `${entities[0]} ||--o{ ${entities[1]} : relates\n`;
    }
    return dsl;
  }

  // Default to Class
  let dsl = `@diagram "Generated Diagram" class\n\n`;
  for (const entity of entities) {
    dsl += `class ${entity} {\n  +id: string\n  +name: string\n}\n\n`;
  }
  if (entities.length >= 2) {
    dsl += `${entities[0]} --> ${entities[1]} : association\n`;
  }
  return dsl;
}
