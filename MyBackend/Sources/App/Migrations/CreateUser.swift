import Fluent

struct CreateUser: Migration {
    func prepare(on database: Database) -> EventLoopFuture<Void> {
        database.schema("users")
            .id()
            .field("name", .string, .required)
            .field("email", .string, .required)
            .field("username", .string)
            .field("profile_image", .string)
            .field("cover_image", .string)
            .field("bio", .string)
            .field("link", .string)
            .field("password", .string)
            .field("created_at", .datetime)
            .field("role", .string)
            .field("is_verified", .bool)
            .field("last_active", .datetime)
            .field("is_active", .bool)
            .field("updated_at", .datetime)
            .create()
    }

    func revert(on database: Database) -> EventLoopFuture<Void> {
        database.schema("users").delete()
    }
}