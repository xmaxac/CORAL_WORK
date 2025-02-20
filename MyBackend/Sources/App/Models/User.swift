import Fluent
import Vapor

final class User: Model, Content {
    static let schema = "users"
    
    @ID(key: .id)
    var id: UUID?
    
    @Field(key: "name")
    var name: String
    
    @Field(key: "email")
    var email: String
    
    @Field(key: "username")
    var username: String?
    
    @Field(key: "profile_image")
    var profileImage: String?
    
    @Field(key: "cover_image")
    var coverImage: String?
    
    @Field(key: "bio")
    var bio: String?
    
    @Field(key: "link")
    var link: String?
    
    @Field(key: "password")
    var password: String
    
    @Field(key: "created_at")
    var createdAt: Date
    
    @Field(key: "role")
    var role: String?
    
    @Field(key: "is_verified")
    var isVerified: Bool
    
    @Field(key: "last_active")
    var lastActive: Date?
    
    @Field(key: "is_active")
    var isActive: Bool
    
    @Field(key: "updated_at")
    var updatedAt: Date?
    
    init() { }
    
    init(
        id: UUID? = nil,
        name: String,
        email: String,
        username: String? = nil,
        profileImage: String? = nil,
        coverImage: String? = nil,
        bio: String? = nil,
        link: String? = nil,
        password: String,
        createdAt: Date = Date(),
        role: String? = nil,
        isVerified: Bool = false,
        lastActive: Date? = nil,
        isActive: Bool = true,
        updatedAt: Date? = nil
    ) {
        self.id = id
        self.name = name
        self.email = email
        self.username = username
        self.profileImage = profileImage
        self.coverImage = coverImage
        self.bio = bio
        self.link = link
        self.password = password
        self.createdAt = createdAt
        self.role = role
        self.isVerified = isVerified
        self.lastActive = lastActive
        self.isActive = isActive
        self.updatedAt = updatedAt
    }
}