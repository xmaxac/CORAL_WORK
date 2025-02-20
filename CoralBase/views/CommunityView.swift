import SwiftUI

struct CommunityView: View {
    @EnvironmentObject var globalData: GlobalData
    @State private var reports: [Report] = []
    @State private var isLoading: Bool = false
    @State private var errorMessage: String? = nil

    var body: some View {
        Group {
            if globalData.isLoggedIn {
                if isLoading {
                    ProgressView("Loading reports...")
                } else if let errorMessage = errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                } else {
                    ScrollView {
                        VStack(spacing: 16) {
                            ForEach(reports) { report in
                                ReportCard(report: report)
                            }
                        }
                        .padding()
                    }
                }
            } else {
                Text("Sign in/Sign Up to view this page")
                    .font(.headline)
                    .foregroundColor(.gray)
            }
        }
        .navigationTitle("Community")
        .onAppear {
            if globalData.isLoggedIn {
                Task {
                    await fetchReports()
                }
            }
        }
    }

    private func fetchReports() async {
        isLoading = true
        errorMessage = nil

        guard let url = URL(string: "http://172.20.10.8:8080/reports") else {
            errorMessage = "Invalid URL"
            isLoading = false
            return
        }

        do {
            let (data, response) = try await URLSession.shared.data(from: url)
            guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
                errorMessage = "Failed to fetch reports"
                isLoading = false
                return
            }

            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            var reports = try decoder.decode([Report].self, from: data)

            // Fetch user details for each report
            for index in reports.indices {
                if let user = await fetchUserDetails(userId: reports[index].userId) {
                    reports[index].fullName = user.fullName
                    reports[index].username = user.username
                }
            }

            self.reports = reports
            isLoading = false
        } catch {
            errorMessage = "Error: \(error.localizedDescription)"
            isLoading = false
        }
    }

    private func fetchUserDetails(userId: UUID) async -> UserDetails? {
        guard let url = URL(string: "http://172.20.10.8:8080/users/\(userId.uuidString)") else {
            return nil
        }

        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let userDetails = try JSONDecoder().decode(UserDetails.self, from: data)
            return userDetails
        } catch {
            print("Failed to fetch user details: \(error.localizedDescription)")
            return nil
        }
    }
}

struct ReportCard: View {
    let report: Report

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Report Title
            Text(report.title)
                .font(.headline)
                .fontWeight(.bold)
            
            // Posted by: Full Name - @Username
            Text("Posted by: \(report.fullName) - @\(report.username)")
                .font(.subheadline)
                .foregroundColor(.gray)
            
            // Report Date
            Text(report.reportDate.formatted(date: .abbreviated, time: .omitted))
                .font(.caption)
                .foregroundColor(.gray)
            
            // Report Description
            Text(report.description ?? "No description provided.")
                .font(.body)
                .padding(.top, 4)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(10)
    }
}

// Report Model (Update this to match your backend response)
struct Report: Identifiable, Codable {
    let id: UUID
    let userId: UUID
    var fullName: String // Make this mutable
    var username: String // Make this mutable
    let latitude: Double
    let longitude: Double
    let countryCode: String
    let description: String?
    let reportDate: Date
    let title: String
    let reefName: String?
    let reefType: String?
    let averageDepth: Int
    let waterTemp: Int
}

// UserDetails Model (to fetch user details from the backend)
struct UserDetails: Codable {
    let id: UUID
    let fullName: String
    let username: String
}
