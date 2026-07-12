/** Sample DSL code for each diagram type. */
export const SAMPLES: Record<string, string> = {
  class: `@diagram "Sample" class

class User {
  +id: string
  +name: string
  -password: string
  +login(username: string, password: string): boolean
  +logout(): void
}

interface Serializable {
  +serialize(): string
  +deserialize(data: string): void
}

abstract class BaseEntity {
  +id: string
  +createdAt: Date
  #validate(): boolean
}

enum Role {
  ADMIN
  USER
  GUEST
}

User --|> BaseEntity
User ..|> Serializable
User --> Role
`,

  sequence: `@diagram "Login Flow" sequence

participant Client as actor
participant Server as object
participant DB as entity

Client -> Server: login(user, pass)
Server -> DB: findUser(user)
DB -->> Server: userData
Server -> Server: validatePassword()
Server -->> Client: authToken
`,

  activity: `@diagram "Order Process" activity

[start]
action "Receive Order"
decision "In Stock?"
action "Ship Order"
action "Close Order"
[end]
`,

  flowchart: `@diagram "Login Flow" flowchart

start "Start"
process "Enter Credentials"
decision "Valid?"
process "Show Dashboard"
end "Done"
`,

  erd: `@diagram "Blog" erd

entity User {
  *id: int
  name: varchar
  email: varchar [unique]
}

entity Post {
  *id: int
  title: varchar
  content: text
  user_id: int [fk]
}

entity Comment {
  *id: int
  body: text
  post_id: int [fk]
  user_id: int [fk]
}

User ||--o{ Post : writes
Post ||--o{ Comment : has
User ||--o{ Comment : writes
`,

  state: `@diagram "Door" state

[initial]
state Closed
state Open
state Locked
state "Active" {
  [initial]
  state Idle
  state Running
  [initial] --> Idle
  Idle --> Running : start
  Running --> Idle : pause
}

[initial] --> Closed
Closed --> Open : open
Open --> Closed : close
Closed --> Locked : lock
Locked --> Closed : unlock
Closed --> "Active" : activate
`,

  usecase: `@diagram "System" usecase

actor User
actor Admin
usecase "Login"
usecase "View Profile"
usecase "Manage Users"

User --> "Login"
User --> "View Profile"
Admin --> "Manage Users"
"Manage Users" <<include>> "Login"
`,

  component: `@diagram "E-Commerce" component

component "Web Browser" <<client>>
component "API Gateway"
component "Auth Service"
component "Product Service"
component "Order Service"
component "Database" <<storage>>

"Web Browser" --> "API Gateway"
"API Gateway" --> "Auth Service"
"API Gateway" --> "Product Service"
"API Gateway" --> "Order Service"
"Product Service" --> "Database"
"Order Service" --> "Database"
`,

  deployment: `@diagram "Production" deployment

node "Web Server" <<EC2>>
node "App Server" <<EC2>>
device "Load Balancer"
node "Database Server" <<RDS>>
artifact "app.war"
artifact "config.yml"

"Load Balancer" --> "Web Server"
"Web Server" --> "App Server"
"App Server" --> "Database Server"
"App Server" ..> "app.war" : manifest
"App Server" ..> "config.yml" : manifest
`,
};
