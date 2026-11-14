/**
 * Universal Code Generator Facade
 * Dispatches code generation across supported programming languages and targets.
 */
export {
  generateTypeScript,
  generateJava,
  generateSQL,
  generateXState,
  generatePython,
  generatePythonPydantic,
  generatePythonSQLAlchemy,
  generateCSharp,
  generateGraphQL,
  generateGolang,
  generateRust,
  type PythonTarget,
} from "./generators";
