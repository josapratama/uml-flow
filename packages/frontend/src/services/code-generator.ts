/**
 * Universal Code Generator Facade
 * Dispatches code generation across supported programming languages and targets.
 */
export {
  generateTypeScript,
  generateJava,
  generateSQL,
  generateXState,
} from "./generators";
