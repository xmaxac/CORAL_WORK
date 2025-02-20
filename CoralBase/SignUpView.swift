import SwiftUI

struct SignUpView: View {
    @State private var name: String = ""
    @State private var username: String = ""
    @State private var email: String = ""
    @State private var password: String = ""
    @State private var showAlert: Bool = false
    @State private var alertMessage: String = ""
    @State private var agreedToTerms: Bool = true
    @State private var verificationCode: String = ""
    @State private var isVerificationStep: Bool = false
    @State private var navigateToProfile: Bool = false
    
    @EnvironmentObject var globalData: GlobalData
    
    @State private var generatedCode: String = ""

    var body: some View {
        
        VStack {
            VStack(spacing: 20) {
                HStack {
                    Text(isVerificationStep ? "Verify Email" : "Sign up")
                        .font(.title)
                        .fontWeight(.regular)
                    Spacer()
                }

                if !isVerificationStep {
                    VStack(spacing: 16) {
                        TextField("Full Name", text: $name)
                            .textFieldStyle(CustomTextFieldStyle())

                        TextField("Username", text: $username)
                            .textFieldStyle(CustomTextFieldStyle())
                            .autocapitalization(.none)

                        TextField("Email", text: $email)
                            .textFieldStyle(CustomTextFieldStyle())
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)

                        SecureField("Password", text: $password)
                            .textFieldStyle(CustomTextFieldStyle())
                    }

                    Button(action: {
                        startSignUp()
                    }) {
                        Text("Create Account")
                            .font(.title3)
                            .fontWeight(.regular)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                            .background(Color.blue)
                            .cornerRadius(8)
                    }
                    .padding(.top, 10)
                } else {
                    VStack(spacing: 16) {
                        Text("A 6-digit verification code has been sent to \(email).")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                            .multilineTextAlignment(.center)

                        TextField("Verification Code", text: $verificationCode)
                            .textFieldStyle(CustomTextFieldStyle())
                            .keyboardType(.numberPad)

                        Button(action: {
                            verifyCode()
                        }) {
                            Text("Verify")
                                .font(.title3)
                                .fontWeight(.regular)
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .frame(height: 50)
                                .background(Color.blue)
                                .cornerRadius(8)
                        }
                    }
                }
            }
            .padding()
            .alert(isPresented: $showAlert) {
                Alert(
                    title: Text(isVerificationStep ? "Verification" : "Sign Up"),
                    message: Text(alertMessage),
                    dismissButton: .default(Text("OK"))
                )
            }

            if !isVerificationStep {
                HStack(alignment: .top, spacing: 8) {
                    Toggle("", isOn: $agreedToTerms)
                        .labelsHidden()
                        .toggleStyle(CheckboxToggleStyle())

                    Text("By continuing, I agree to the Terms of Use & Privacy Policy.")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .padding(.top, 10)

                HStack {
                    Text("Already have an account?")
                        .foregroundColor(.gray)
                    NavigationLink(destination: LoginView()) {
                        Text("Login Here")
                    }
                    .foregroundColor(.blue)
                }
                .padding(.top, 20)
                .font(.subheadline)
            }

            Spacer()
               
        }
    }

    func startSignUp() {
        // Validate input
        guard !name.isEmpty, !username.isEmpty, !email.isEmpty, !password.isEmpty, agreedToTerms else {
            alertMessage = "Please fill in all fields and agree to the terms."
            showAlert = true
            return
        }

        // Generate a 6-digit verification code
        generatedCode = String(format: "%06d", Int.random(in: 0..<1000000))
        print("Generated Code: \(generatedCode)") // For testing purposes

        // Simulate sending the code via email (replace with actual email sending logic)
        alertMessage = "A 6-digit verification code has been sent to \(email)."
        showAlert = true

        // Move to the verification step
        isVerificationStep = true
    }

    func verifyCode() {
        // Validate the verification code
        guard verificationCode == generatedCode else {
            alertMessage = "Invalid verification code. Please try again."
            showAlert = true
            return
        }

        // Proceed with sign-up
        createUser()
        globalData.count = 8
    }

    func createUser() {
        // Create the request body
        let user = UserSignUpRequest(
            name: name,
            email: email,
            username: username,
            password: password,
            profileImage: nil,
            coverImage: nil,
            bio: nil,
            link: nil,
            role: nil,
            isVerified: true,
            lastActive: nil,
            isActive: true,
            createdAt: Date(),
            updatedAt: nil
        )

        guard let url = URL(string: "http://172.20.10.8:8080/signup") else {
            alertMessage = "Invalid URL."
            showAlert = true
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        do {
            let jsonData = try JSONEncoder().encode(user)
            request.httpBody = jsonData
        } catch {
            alertMessage = "Failed to encode user data."
            showAlert = true
            return
        }

        // Send the request
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                DispatchQueue.main.async {
                    alertMessage = "Error: \(error.localizedDescription)"
                    showAlert = true
                }
                return
            }

            guard let httpResponse = response as? HTTPURLResponse else {
                DispatchQueue.main.async {
                    alertMessage = "Invalid response from server."
                    showAlert = true
                }
                return
            }

            if httpResponse.statusCode == 200 {
                // Parse the response to get the user's UUID
                if let data = data {
                    do {
                        let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any]
                        if let userIdString = json?["id"] as? String,
                           let userId = UUID(uuidString: userIdString) {
                            DispatchQueue.main.async {
                                // Store the UUID in globalData
                                globalData.userId = userId
                                globalData.fullName = name
                                globalData.userName = username
                                globalData.email = email
                                globalData.password = password
                                globalData.isLoggedIn = true

                                alertMessage = "Sign up successful! You are now verified."
                                showAlert = true
                                navigateToProfile = true
                            }
                        } else {
                            DispatchQueue.main.async {
                                alertMessage = "Failed to parse user ID from response."
                                showAlert = true
                            }
                        }
                    } catch {
                        DispatchQueue.main.async {
                            alertMessage = "Failed to decode response."
                            showAlert = true
                        }
                    }
                }
            } else {
                DispatchQueue.main.async {
                    alertMessage = "Sign up failed. Status code: \(httpResponse.statusCode)"
                    showAlert = true
                }
            }
        }.resume()
    
    }
}

// Custom TextField Style
struct CustomTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color(.systemGray6))
            )
    }
}

// Custom Checkbox Toggle Style
struct CheckboxToggleStyle: ToggleStyle {
    func makeBody(configuration: Configuration) -> some View {
        HStack {
            Image(systemName: configuration.isOn ? "checkmark.square.fill" : "square")
                .foregroundColor(configuration.isOn ? .blue : .gray)
                .onTapGesture {
                    configuration.isOn.toggle()
                }
            configuration.label
        }
    }
}

// UserSignUpRequest struct
struct UserSignUpRequest: Codable {
    let name: String
    let email: String
    let username: String
    let password: String
    let profileImage: String? // Set to NULL
    let coverImage: String? // Set to NULL
    let bio: String? // Set to NULL
    let link: String? // Set to NULL
    let role: String? // Set to NULL
    let isVerified: Bool // Set to true after verification
    let lastActive: String? // Set to NULL
    let isActive: Bool // Default to true
    let createdAt: String // Set to current date as ISO 8601 string
    let updatedAt: String? // Set to NULL

    init(
        name: String,
        email: String,
        username: String,
        password: String,
        profileImage: String? = nil,
        coverImage: String? = nil,
        bio: String? = nil,
        link: String? = nil,
        role: String? = nil,
        isVerified: Bool = false,
        lastActive: Date? = nil,
        isActive: Bool = true,
        createdAt: Date = Date(),
        updatedAt: Date? = nil
    ) {
        self.name = name
        self.email = email
        self.username = username
        self.password = password
        self.profileImage = profileImage
        self.coverImage = coverImage
        self.bio = bio
        self.link = link
        self.role = role
        self.isVerified = isVerified
        self.lastActive = lastActive?.toISO8601String()
        self.isActive = isActive
        self.createdAt = createdAt.toISO8601String()
        self.updatedAt = updatedAt?.toISO8601String()
    }
}

// Extension to convert Date to ISO 8601 string
extension Date {
    func toISO8601String() -> String {
        let formatter = ISO8601DateFormatter()
        return formatter.string(from: self)
    }
}
