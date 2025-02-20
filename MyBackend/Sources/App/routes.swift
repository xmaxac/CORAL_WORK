import Vapor
import Fluent

func routes(_ app: Application) throws {
    
    // Test endpoint
    app.post("test") { req -> String in
        return "Test endpoint is working!"
    }

    // Get all users
    app.get("users") { req -> EventLoopFuture<[User]> in
        return User.query(on: req.db).all()
    }

    // Create a new user
    app.post("users") { req -> EventLoopFuture<User> in
        let user = try req.content.decode(User.self)
        return user.save(on: req.db).map { user }
    }

    // Signup endpoint
    app.post("signup") { req -> EventLoopFuture<User> in
        let user = try req.content.decode(User.self)
        return user.save(on: req.db).map { user }
    }

    // Get a specific user by ID
    app.get("users", ":userID") { req -> EventLoopFuture<User> in
        guard let userID = req.parameters.get("userID", as: UUID.self) else {
            throw Abort(.badRequest, reason: "Invalid user ID")
        }
        return User.find(userID, on: req.db)
            .unwrap(or: Abort(.notFound, reason: "User not found"))
    }

    // Update a user by ID
    app.put("users", ":userID") { req -> EventLoopFuture<User> in
        guard let userID = req.parameters.get("userID", as: UUID.self) else {
            throw Abort(.badRequest, reason: "Invalid user ID")
        }
        let updatedUser = try req.content.decode(User.self)
        return User.find(userID, on: req.db)
            .unwrap(or: Abort(.notFound, reason: "User not found"))
            .flatMap { user in
                user.name = updatedUser.name
                user.email = updatedUser.email
                return user.save(on: req.db).map { user }
            }
    }

    // Delete a user by ID
    app.delete("users", ":userID") { req -> EventLoopFuture<HTTPStatus> in
        guard let userID = req.parameters.get("userID", as: UUID.self) else {
            throw Abort(.badRequest, reason: "Invalid user ID")
        }
        return User.find(userID, on: req.db)
            .unwrap(or: Abort(.notFound, reason: "User not found"))
            .flatMap { user in
                return user.delete(on: req.db)
            }
            .transform(to: .noContent)
    }

    // Login endpoint
    app.post("login") { req -> EventLoopFuture<HTTPStatus> in
        let credentials = try req.content.decode(LoginRequest.self)

        return User.query(on: req.db)
            .group(.or) { or in
                or.filter(\.$email == credentials.emailOrName)
                or.filter(\.$name == credentials.emailOrName)
            }
            .filter(\.$password == credentials.password)
            .first()
            .flatMapThrowing { user in
                guard let user = user else {
                    throw Abort(.unauthorized, reason: "Invalid email/name or password")
                }
                return HTTPStatus.ok
            }
    }

    // Create a new report
    app.post("reports") { req -> EventLoopFuture<Report> in
        let report = try req.content.decode(Report.self)
        return report.save(on: req.db).map { report }
    }

    // Get all reports
    app.get("reports") { req -> EventLoopFuture<[Report]> in
        return Report.query(on: req.db).all()
    }

    // Video prediction endpoint
    app.post("predict_video") { req -> EventLoopFuture<String> in
    return req.body.collect().flatMapThrowing { body in
        // Ensure the request contains video data
        guard let body = body else {
            throw Abort(.badRequest, reason: "No video data found in request")
        }

        // Convert ByteBuffer to Data
        let videoData = Data(buffer: body)

        // Prepare the multipart form data
        let boundary = "Boundary-\(UUID().uuidString)"
        var headers = HTTPHeaders()
        headers.add(name: "Content-Type", value: "multipart/form-data; boundary=\(boundary)")

        // Create the multipart body
        var multipartBody = Data()
        multipartBody.append("--\(boundary)\r\n".data(using: .utf8)!)
        multipartBody.append("Content-Disposition: form-data; name=\"file\"; filename=\"video.mp4\"\r\n".data(using: .utf8)!)
        multipartBody.append("Content-Type: video/mp4\r\n\r\n".data(using: .utf8)!)
        multipartBody.append(videoData)
        multipartBody.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)

        // Send the request to the AI service
        let aiServiceURL = URI(string: "http://18.216.127.127:8080/predict_video")
        return try req.client.post(aiServiceURL, headers: headers) { clientRequest in
            clientRequest.body = .init(data: multipartBody)
        }.flatMapThrowing { clientResponse in
            // Ensure the AI service responded successfully
            guard clientResponse.status == .ok else {
                throw Abort(.internalServerError, reason: "AI service returned status: \(clientResponse.status)")
            }

            // Parse the JSON response
            guard let responseBody = clientResponse.body else {
                throw Abort(.internalServerError, reason: "No response body from AI service")
            }

            let predictionResult = try JSONDecoder().decode(PredictionResult.self, from: responseBody)

            // Process the prediction result
            let detectedFrames = predictionResult.detected_frames
            let confidence = detectedFrames.first?.confidence ?? 0.0
            let predictionTime = predictionResult.prediction_time

            return "Prediction Confidence: \(confidence), Time Taken: \(predictionTime) seconds"
        }.wait()
    }
}

}

// MARK: - Data Models

struct LoginRequest: Content {
    let emailOrName: String
    let password: String
}

struct PredictionResult: Codable {
    let detected_frames: [DetectedFrame]
    let prediction_time: Double
}

struct DetectedFrame: Codable {
    let frame_number: Int
    let frame: String // Base64 encoded image data
    let confidence: Double
}