import Vapor
import Fluent

final class Report: Model, Content {
    static let schema = "reports"

    @ID(key: .id)
    var id: UUID?

   
    @Parent(key: "user_id")
    var user: User

    @Field(key: "latitude")
    var latitude: Double

    @Field(key: "longitude")
    var longitude: Double

    @Field(key: "country_code")
    var countryCode: String

    @Field(key: "description")
    var description: String?

    @Field(key: "report_date")
    var reportDate: Date

    @Timestamp(key: "created_at", on: .create)
    var createdAt: Date?

    @Timestamp(key: "updated_at", on: .update)
    var updatedAt: Date?

    @Field(key: "title")
    var title: String

    @Field(key: "reef_name")
    var reefName: String?

    @Field(key: "reef_type")
    var reefType: String?

    @Field(key: "average_depth")
    var averageDepth: Int?

    @Field(key: "water_temp")
    var waterTemp: Int?

    init() {}

    init(
        id: UUID? = nil,
        userId: UUID,
        latitude: Double,
        longitude: Double,
        countryCode: String,
        description: String? = nil,
        reportDate: Date,
        title: String,
        reefName: String? = nil,
        reefType: String? = nil,
        averageDepth: Int? = nil,
        waterTemp: Int? = nil
    ) {
        self.id = id
        self.$user.id = userId
        self.latitude = latitude
        self.longitude = longitude
        self.countryCode = countryCode
        self.description = description
        self.reportDate = reportDate
        self.title = title
        self.reefName = reefName
        self.reefType = reefType
        self.averageDepth = averageDepth
        self.waterTemp = waterTemp
    }

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case latitude
        case longitude
        case countryCode = "country_code"
        case description
        case reportDate = "report_date"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case title
        case reefName = "reef_name"
        case reefType = "reef_type"
        case averageDepth = "average_depth"
        case waterTemp = "water_temp"
    }

    required init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decodeIfPresent(UUID.self, forKey: .id)
        self.$user.id = try container.decode(UUID.self, forKey: .userId)
        self.latitude = try container.decode(Double.self, forKey: .latitude)
        self.longitude = try container.decode(Double.self, forKey: .longitude)
        self.countryCode = try container.decode(String.self, forKey: .countryCode)
        self.description = try container.decodeIfPresent(String.self, forKey: .description)

        let reportDateString = try container.decode(String.self, forKey: .reportDate)
        let dateFormatter = ISO8601DateFormatter()
        dateFormatter.formatOptions = [.withFullDate]
        guard let reportDate = dateFormatter.date(from: reportDateString) else {
            throw Abort(.badRequest, reason: "Invalid date format for report_date. Use YYYY-MM-DD.")
        }
        self.reportDate = reportDate

        self.title = try container.decode(String.self, forKey: .title)
        self.reefName = try container.decodeIfPresent(String.self, forKey: .reefName)
        self.reefType = try container.decodeIfPresent(String.self, forKey: .reefType)
        self.averageDepth = try container.decodeIfPresent(Int.self, forKey: .averageDepth)
        self.waterTemp = try container.decodeIfPresent(Int.self, forKey: .waterTemp)
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encodeIfPresent(id, forKey: .id)
        try container.encode($user.id, forKey: .userId)
        try container.encode(latitude, forKey: .latitude)
        try container.encode(longitude, forKey: .longitude)
        try container.encode(countryCode, forKey: .countryCode)
        try container.encodeIfPresent(description, forKey: .description)

        let dateFormatter = ISO8601DateFormatter()
        dateFormatter.formatOptions = [.withFullDate]
        let reportDateString = dateFormatter.string(from: reportDate)
        try container.encode(reportDateString, forKey: .reportDate)

        try container.encode(title, forKey: .title)
        try container.encodeIfPresent(reefName, forKey: .reefName)
        try container.encodeIfPresent(reefType, forKey: .reefType)
        try container.encodeIfPresent(averageDepth, forKey: .averageDepth)
        try container.encodeIfPresent(waterTemp, forKey: .waterTemp)
    }
}