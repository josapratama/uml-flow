import type { Diagram } from "@uml-editor/shared";
import {
  BUILT_IN_TEMPLATES,
  type DiagramTemplate,
} from "./builtInTemplates";

export { BUILT_IN_TEMPLATES, type DiagramTemplate };

const STORAGE_KEY = "uml-editor-templates";

/** Save current diagram as a user template. */
export function saveTemplate(
  name: string,
  description: string,
  diagram: Diagram,
  dsl?: string
): DiagramTemplate {
  const customTemplates = loadCustomTemplates();
  const template: DiagramTemplate = {
    id: `tmpl_user_${Date.now()}`,
    name,
    description,
    category: "custom",
    tag: "Custom",
    isBuiltIn: false,
    diagram: structuredClone(diagram),
    dsl,
    createdAt: new Date().toISOString(),
  };
  customTemplates.unshift(template);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customTemplates));
  return template;
}

/** Load only user-created templates from localStorage. */
function loadCustomTemplates(): DiagramTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Load all templates (built-in templates + user saved templates). */
export function loadTemplates(): DiagramTemplate[] {
  const custom = loadCustomTemplates();
  return [...BUILT_IN_TEMPLATES, ...custom];
}

/** Get a single template by ID. */
export function getTemplateById(id: string): DiagramTemplate | null {
  const all = loadTemplates();
  return all.find((t) => t.id === id) || null;
}

/** Delete a user template by ID (built-in templates cannot be deleted). */
export function deleteTemplate(id: string): void {
  const templates = loadCustomTemplates().filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

/** Load a template and return a fresh diagram copy with new ID. */
export function loadTemplateAsDiagram(id: string): Diagram | null {
  const tmpl = getTemplateById(id);
  if (!tmpl) return null;
  const diagram = structuredClone(tmpl.diagram);
  diagram.id = `diagram_${Date.now()}`;
  diagram.metadata = {
    ...diagram.metadata,
    updatedAt: new Date().toISOString(),
  };
  return diagram;
}
