// ============================================
// Custom UML DSL Grammar Definition
// ============================================
//
// === CLASS DIAGRAM ===
// @diagram "MyApp" class
//
// class User {
//   +id: string
//   +name: string
//   -password: string
//   +login(username: string, password: string): boolean
// }
//
// interface Serializable {
//   +serialize(): string
// }
//
// User --|> BaseEntity          // inheritance
// User ..|> Serializable       // realization
// User --> Role                 // association
// User o-- Profile             // aggregation
// User *-- Address             // composition
// User ..> Logger              // dependency
//
// === SEQUENCE DIAGRAM ===
// @diagram "Login Flow" sequence
//
// participant Client as actor
// participant Server as object
// participant DB as entity
//
// Client -> Server: login(user, pass)
// Server -> DB: findUser(user)
// DB --> Server: userData
// Server --> Client: token
//
// [alt] condition
//   Server -> Client: success
// [else]
//   Server -> Client: error
// [end]
//
// === USE CASE DIAGRAM ===
// @diagram "System" usecase
//
// actor User
// actor Admin
// system "My System" {
//   usecase "Login"
//   usecase "Manage Users"
// }
// User --> "Login"
// Admin --> "Manage Users"
// "Manage Users" <<include>> "Login"
//
// === ACTIVITY DIAGRAM ===
// @diagram "Process" activity
//
// [start]
// action "Receive Order"
// decision "In Stock?"
//   [yes] action "Ship Order"
//   [no] action "Back Order"
// merge
// action "Close Order"
// [end]
//
// === STATE DIAGRAM ===
// @diagram "Door" state
//
// [initial]
// state Closed
// state Open
// state Locked
//
// [initial] --> Closed
// Closed --> Open : open
// Open --> Closed : close
// Closed --> Locked : lock
// Locked --> Closed : unlock
//
// === FLOWCHART ===
// @diagram "Process" flowchart
//
// start "Start"
// process "Do Something"
// decision "OK?"
//   [yes] process "Continue"
//   [no] process "Retry"
// end "Done"
//
// === ERD ===
// @diagram "Database" erd
//
// entity User {
//   *id: int
//   name: varchar
//   email: varchar [unique]
//   role_id: int [fk]
// }
//
// entity Role {
//   *id: int
//   name: varchar
// }
//
// User }o--|| Role : has
//
// ERD Relation symbols:
// ||--|| one-to-one
// ||--o{ one-to-many
// }o--|| many-to-one (reverse)
// }o--o{ many-to-many
//

export const DSL_KEYWORDS = [
  "class",
  "interface",
  "abstract",
  "enum",
  "participant",
  "actor",
  "usecase",
  "system",
  "state",
  "activity",
  "action",
  "decision",
  "merge",
  "fork",
  "join",
  "start",
  "end",
  "process",
  "io",
  "document",
  "database",
  "subroutine",
  "entity",
  "component",
  "node",
  "artifact",
  "package",
  "@diagram",
  "as",
] as const;

export const DSL_RELATION_SYMBOLS: Record<
  string,
  { type: string; description: string }
> = {
  "--|>": { type: "inheritance", description: "Inheritance (extends)" },
  "..|>": { type: "realization", description: "Realization (implements)" },
  "-->": { type: "association", description: "Association" },
  "o--": { type: "aggregation", description: "Aggregation" },
  "*--": { type: "composition", description: "Composition" },
  "..>": { type: "dependency", description: "Dependency" },
  "<<include>>": { type: "include", description: "Include (use case)" },
  "<<extend>>": { type: "extend", description: "Extend (use case)" },
  "->": { type: "sync", description: "Synchronous message" },
  "-->>": { type: "async", description: "Asynchronous/return message" },
  "||--||": { type: "one-to-one", description: "One to one (ERD)" },
  "||--o{": { type: "one-to-many", description: "One to many (ERD)" },
  "}o--||": { type: "one-to-many", description: "Many to one (ERD)" },
  "}o--o{": { type: "many-to-many", description: "Many to many (ERD)" },
};

export const DSL_VISIBILITY_MAP: Record<string, string> = {
  "+": "public",
  "-": "private",
  "#": "protected",
  "~": "package",
};

export type DSLToken = {
  type:
    | "keyword"
    | "identifier"
    | "symbol"
    | "string"
    | "operator"
    | "punctuation"
    | "visibility"
    | "type"
    | "newline"
    | "comment"
    | "bracket";
  value: string;
  line: number;
  column: number;
};
