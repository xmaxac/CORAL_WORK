import Fluent

struct CreateTodo: Migration {
    func prepare(on database: Database) -> EventLoopFuture<Void> {
        database.schema("gyatt") // Table name
            .id() // Automatically adds an `id` column (UUID)
            .field("title", .string, .required) // Adds a `title` column
            .field("created_at", .datetime) // Optional: Add a timestamp
            .field("updated_at", .datetime) // Optional: Add a timestamp
            .create()
    }

    func revert(on database: Database) -> EventLoopFuture<Void> {
        database.schema("todos").delete() // Drops the table
    }
}