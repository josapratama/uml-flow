/**
 * PlantUML to UML Flow DSL Converter
 * Converts common PlantUML syntax (@startuml ... @enduml) into UML Flow DSL.
 */

export function isPlantUMLCode(text: string): boolean {
  if (!text) return false;
  return /@startuml/i.test(text);
}

export function parsePlantUMLToDSL(
  plantUmlText: string,
  diagramName = "Imported PlantUML Diagram",
): string {
  const lines = plantUmlText
    .replace(/@startuml[^\n]*/i, "")
    .replace(/@enduml/i, "")
    .split("\n");

  const classes: Array<{ name: string; type: string; members: string[] }> = [];
  const relations: string[] = [];
  let currentClass: { name: string; type: string; members: string[] } | null =
    null;

  let diagramType = "class";

  for (let rawLine of lines) {
    let line = rawLine.trim();
    if (!line || line.startsWith("'") || line.startsWith("/'")) continue;

    // Detect class block: class Foo { or interface Bar {
    const blockMatch = line.match(
      /^(class|interface|abstract\s+class|enum)\s+([A-Za-z0-9_]+)\s*(?:\{)?$/i,
    );
    if (blockMatch) {
      const type = blockMatch[1].toLowerCase().includes("interface")
        ? "interface"
        : blockMatch[1].toLowerCase().includes("abstract")
        ? "abstract"
        : blockMatch[1].toLowerCase().includes("enum")
        ? "enum"
        : "class";
      currentClass = { name: blockMatch[2], type, members: [] };
      classes.push(currentClass);
      continue;
    }

    if (line === "}") {
      currentClass = null;
      continue;
    }

    // Inside class block: member
    if (currentClass) {
      currentClass.members.push(line);
      continue;
    }

    // Relationships: A --|> B, A ..|> B, A --> B, A --* B, A --o B
    const relMatch = line.match(
      /^([A-Za-z0-9_]+)\s*(--\|>|\.\.\|>|-->|<--|--\*|--o|--)\s*([A-Za-z0-9_]+)(?:\s*:\s*(.+))?$/,
    );
    if (relMatch) {
      const source = relMatch[1];
      const arrow = relMatch[2];
      const target = relMatch[3];
      const label = relMatch[4] ? ` : ${relMatch[4].trim()}` : "";

      let mappedArrow = "-->";
      if (arrow === "--|>") mappedArrow = "--|>";
      else if (arrow === "..|>") mappedArrow = "..|>";
      else if (arrow === "--*") mappedArrow = "--*";
      else if (arrow === "--o") mappedArrow = "--o";

      relations.push(`${source} ${mappedArrow} ${target}${label}`);
      continue;
    }
  }

  const output: string[] = [`@diagram "${diagramName}" ${diagramType}`, ""];

  for (const cls of classes) {
    const prefix =
      cls.type === "class" ? "class" : `${cls.type}`;
    output.push(`${prefix} ${cls.name} {`);
    for (const m of cls.members) {
      output.push(`  ${m}`);
    }
    output.push("}");
    output.push("");
  }

  for (const rel of relations) {
    output.push(rel);
  }

  return output.join("\n");
}
