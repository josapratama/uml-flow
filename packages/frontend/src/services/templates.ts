import type { Diagram } from "@uml-editor/shared";

const STORAGE_KEY = "uml-editor-templates";

export interface DiagramTemplate {
  id: string;
  name: string;
  description: string;
  diagram: Diagram;
  createdAt: string;
}

/** Save current diagram as a template. */
export function saveTemplate(
  name: string,
  description: string,
  diagram: Diagram,
): DiagramTemplate {
  const templates = loadTemplates();
  const template: DiagramTemplate = {
    id: `tmpl_${Date.now()}`,
    name,
    description,
    diagram: structuredClone(diagram),
    createdAt: new Date().toISOString(),
  };
  templates.push(template);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  return template;
}

/** Load all saved templates. */
export function loadTemplates(): DiagramTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Delete a template by ID. */
export function deleteTemplate(id: string): void {
  const templates = loadTemplates().filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

/** Load a template and return a fresh diagram copy. */
export function loadTemplateAsDiagram(id: string): Diagram | null {
  const templates = loadTemplates();
  const tmpl = templates.find((t) => t.id === id);
  if (!tmpl) return null;
  const diagram = structuredClone(tmpl.diagram);
  diagram.id = `diagram_${Date.now()}`;
  diagram.metadata.updatedAt = new Date().toISOString();
  return diagram;
}
