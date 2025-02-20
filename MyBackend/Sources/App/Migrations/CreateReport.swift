import Fluent

struct CreateReport: Migration {
    // Name of the migration
    func prepare(on database: Database) -> EventLoopFuture<Void> {
        return database.schema("reports")
            .id() 
            .field("user_id", .uuid, .required, .references("users", "id", onDelete: .cascade)) // Foreign key
            
            .field("latitude", .double, .required) 
            .field("longitude", .double, .required) 
            .field("country_code", .string, .required)
            .field("description", .string) 
            .field("report_date", .date, .required) 
            .field("created_at", .datetime) 
            .field("updated_at", .datetime) 
            .field("title", .string, .required) 
            .field("reef_name", .string)
            .field("reef_type", .string) 
            .field("average_depth", .int) 
            .field("water_temp", .int) 
            .create()
    }

    // Revert the migration (drop the table)
    func revert(on database: Database) -> EventLoopFuture<Void> {
        return database.schema("reports").delete()
    }
}