import SwiftUI

struct LoginView: View {
    @State private var emailOrName: String = ""
    @State private var password: String = ""
    @State private var showAlert: Bool = false
    @State private var alertMessage: String = ""
    @State var firstView = true
    @State var appeared: Double = 0
    
    @EnvironmentObject var globalData: GlobalData
    
    var body: some View {
        
        VStack{
            
            
            VStack(spacing: 20) {
                HStack {
                    Text("Login")
                        .font(.title)
                        .fontWeight(.regular)
                    Spacer()
                }
                
                VStack(spacing: 16) {
                    
                    TextField("Email or Name", text: $emailOrName)
                        .textFieldStyle(CustomTextFieldStyle())
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                    
                    SecureField("Password", text: $password)
                        .textFieldStyle(CustomTextFieldStyle())
                }
                
                Button(action: {
                    login()
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
            }
            .padding()
            .alert(isPresented: $showAlert) {
                Alert(
                    title: Text("Sign Up"),
                    message: Text(alertMessage),
                    dismissButton: .default(Text("OK"))
                )
            }
            
            Spacer()
            
           
        }
        .alert(isPresented: $showAlert) {
            Alert(
                title: Text("Login"),
                message: Text(alertMessage),
                dismissButton: .default(Text("OK"))
            )
        }
    }

    func login() {
        // Validate input
        guard !emailOrName.isEmpty, !password.isEmpty else {
            alertMessage = "Please enter your email/name and password."
            showAlert = true
            return
        }

        // Create the request body
        let credentials = LoginRequest(emailOrName: emailOrName, password: password)
        guard let url = URL(string: "http://172.20.10.8:8080/login") else {
            alertMessage = "Invalid URL."
            showAlert = true
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        do {
            let jsonData = try JSONEncoder().encode(credentials)
            request.httpBody = jsonData
        } catch {
            alertMessage = "Failed to encode login data."
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
                DispatchQueue.main.async {
                    alertMessage = "Login successful!"
                    showAlert = true
                    
                    globalData.password = password
                    globalData.isLoggedIn = true
                    
                    
                    globalData.count = 8
                }
            } else {
                DispatchQueue.main.async {
                    alertMessage = "Login failed. Please check your credentials."
                    showAlert = true
                }
            }
        }.resume()
    }
}

struct LoginRequest: Codable {
    let emailOrName: String
    let password: String
}
