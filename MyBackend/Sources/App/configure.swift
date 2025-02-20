import Vapor
import Fluent
import FluentPostgresDriver

public func configure(_ app: Application) throws {
    
   
    app.databases.use(.postgres(
        hostname: Environment.get("DATABASE_HOST") ?? "localhost", 
        port: Environment.get("DATABASE_PORT").flatMap(Int.init(_:)) ?? 5432,
        username: Environment.get("DATABASE_USERNAME") ?? "postgres", 
        password: Environment.get("DATABASE_PASSWORD") ?? "Bekzod#6985", 
        database: Environment.get("DATABASE_NAME") ?? "postgres" 
    ), as: .psql)

    let corsConfiguration = CORSMiddleware.Configuration(
        allowedOrigin: .all,
        allowedMethods: [.GET, .POST, .PUT, .DELETE, .OPTIONS],
        allowedHeaders: [.accept, .authorization, .contentType, .origin, .xRequestedWith]
    )
    app.middleware.use(CORSMiddleware(configuration: corsConfiguration))

    app.middleware.use(ErrorMiddleware.default(environment: app.environment))
    app.routes.defaultMaxBodySize = "1000mb"

    try routes(app)

    app.migrations.add(CreateUser()) 
    app.migrations.add(CreateReport())

    try app.autoMigrate().wait()

    app.http.server.configuration.hostname = Environment.get("SERVER_HOST") ?? "172.20.10.8" 
    app.http.server.configuration.port = Environment.get("SERVER_PORT").flatMap(Int.init(_:)) ?? 8080 

    app.logger.logLevel = .debug

    try app.autoMigrate().wait()
}