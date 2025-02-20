import SwiftUI
import Foundation

class URLSessionDelegateHandler: NSObject, URLSessionDelegate {
    func urlSession(_ session: URLSession, didReceive challenge: URLAuthenticationChallenge, completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {
        if let serverTrust = challenge.protectionSpace.serverTrust {
            let credential = URLCredential(trust: serverTrust)
            completionHandler(.useCredential, credential)
        } else {
            completionHandler(.cancelAuthenticationChallenge, nil)
        }
    }
}

struct DetectView: View {
    @State private var image: UIImage? = nil
    @State private var predictedClass: String? = nil
    @State private var confidenceScore: Double? = nil
    @State private var isShowingImagePicker = false
    @State private var errorMessage: String? = nil
    
    var body: some View {
        VStack(spacing: 20) {
     
            Text("Image Analysis")
                .font(.system(size: 30))
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal)

            if let image = image {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFit()
                    .frame(maxWidth: .infinity)
                    .frame(height: 300)
                    .cornerRadius(12)
                    .shadow(radius: 3)
                    .padding(.horizontal)
            } else {
                Rectangle()
                    .fill(Color(UIColor.systemGray6))
                    .frame(maxWidth: .infinity)
                    .frame(height: 300)
                    .cornerRadius(12)
                    .overlay(
                        Text("No image selected")
                            .foregroundColor(.gray)
                    )
                    .padding(.horizontal)
            }

            Button(action: {
                isShowingImagePicker = true
            }) {
                HStack {
                    Spacer()
                    Text("Select Image")
                        .font(.headline)
                        .foregroundColor(.white)
                    Spacer()
                }
                .padding()
                .background(Color.blue)
                .cornerRadius(12)
                .padding(.horizontal)
            }

            if let predictedClass = predictedClass, let confidenceScore = confidenceScore {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Analysis Results")
                        .font(.headline)
                        .padding(.horizontal)
                    
                    VStack(alignment: .leading, spacing: 5) {
                        Text("Prediction: \(predictedClass)")
                            .font(.system(size: 20, weight: .medium))
                        Text("Confidence: \(String(format: "%.2f", confidenceScore * 100))%")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(UIColor.systemGray6))
                    .cornerRadius(12)
                    .padding(.horizontal)
                }
            }

            if let errorMessage = errorMessage {
                Text("Error: \(errorMessage)")
                    .foregroundColor(.red)
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(UIColor.systemGray6).opacity(0.5))
                    .cornerRadius(8)
                    .padding(.horizontal)
            }

            if image != nil {
                Button(action: {
                    if let image = image {
                        sendImageToServer(image: image) { result, confidence, error in
                            DispatchQueue.main.async {
                                if let result = result, let confidence = confidence {
                                    predictedClass = result
                                    confidenceScore = confidence
                                    errorMessage = nil
                                } else if let error = error {
                                    errorMessage = error.localizedDescription
                                }
                            }
                        }
                    }
                }) {
                    HStack {
                        Spacer()
                        Text("Analyze Image")
                            .font(.headline)
                            .foregroundColor(.white)
                        Spacer()
                    }
                    .padding()
                    .background(Color.blue)
                    .cornerRadius(12)
                    .padding(.horizontal)
                }
            }
            
            Spacer()

        }
        .sheet(isPresented: $isShowingImagePicker) {
            ImagePicker(image: $image)
        }
    }
    
    func sendImageToServer(image: UIImage, completion: @escaping (String?, Double?, Error?) -> Void) {
        guard let url = URL(string: "http://172.20.10.8:3000/upload") else {
            completion(nil, nil, NSError(domain: "Invalid URL", code: 0, userInfo: nil))
            return
        }
        
        guard let imageData = image.jpegData(compressionQuality: 0.8) else {
            completion(nil, nil, NSError(domain: "Image conversion error", code: 0, userInfo: nil))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        
        let boundary = "Boundary-\(UUID().uuidString)"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        
        var body = Data()
        let filename = "image.jpg"
        
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"\(filename)\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(imageData)
        body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)
        
        request.httpBody = body
        
        let session = URLSession(configuration: .default, delegate: URLSessionDelegateHandler(), delegateQueue: nil)
        
        let task = session.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(nil, nil, error)
                return
            }
            
            guard let data = data else {
                completion(nil, nil, NSError(domain: "No response data", code: 0, userInfo: nil))
                return
            }
            
            do {
                let jsonResponse = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any]
                if let predictedClass = jsonResponse?["predictedClass"] as? String,
                   let confidence = jsonResponse?["confidence"] as? Double {
                    completion(predictedClass, confidence, nil)
                } else {
                    completion(nil, nil, NSError(domain: "Invalid response format", code: 0, userInfo: nil))
                }
            } catch {
                completion(nil, nil, error)
            }
        }
        task.resume()
    }
}

struct ImagePicker: UIViewControllerRepresentable {
    @Binding var image: UIImage?
    
    func makeCoordinator() -> Coordinator {
        return Coordinator(self)
    }
    
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = .photoLibrary
        picker.delegate = context.coordinator
        return picker
    }
    
    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}
    
    class Coordinator: NSObject, UINavigationControllerDelegate, UIImagePickerControllerDelegate {
        let parent: ImagePicker
        
        init(_ parent: ImagePicker) {
            self.parent = parent
        }
        
        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            if let selectedImage = info[.originalImage] as? UIImage {
                parent.image = selectedImage
            }
            picker.dismiss(animated: true)
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        DetectView()
    }
}
