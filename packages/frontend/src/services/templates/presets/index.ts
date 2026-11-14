import type { DiagramTemplate } from "./types";
import { ACADEMIC_FLOWCHART_TEMPLATES } from "./academicFlowchartTemplates";
import { ACADEMIC_ERD_TEMPLATES } from "./academicErdTemplates";
import { ACADEMIC_ARCHITECTURE_TEMPLATES } from "./academicArchitectureTemplates";
import { ACADEMIC_USECASE_TEMPLATES } from "./academicUsecaseTemplates";
import { ENTERPRISE_ARCHITECTURE_TEMPLATES } from "./enterpriseArchitectureTemplates";

export * from "./types";
export * from "./academicFlowchartTemplates";
export * from "./academicErdTemplates";
export * from "./academicArchitectureTemplates";
export * from "./academicUsecaseTemplates";
export * from "./enterpriseArchitectureTemplates";

export const BUILT_IN_TEMPLATES: DiagramTemplate[] = [
  ...ENTERPRISE_ARCHITECTURE_TEMPLATES,
  ...ACADEMIC_ARCHITECTURE_TEMPLATES,
  ...ACADEMIC_FLOWCHART_TEMPLATES,
  ...ACADEMIC_ERD_TEMPLATES,
  ...ACADEMIC_USECASE_TEMPLATES,
];
