import SwiftUI
import MapKit
import PhotosUI
import UIKit

// UIKit wrapper for MapKit to handle precise tapping
struct MapViewWithTap: UIViewRepresentable {
    @Binding var region: MKCoordinateRegion
    var onTap: (CLLocationCoordinate2D) -> Void
    var annotationCoordinate: CLLocationCoordinate2D?
    
    func makeUIView(context: Context) -> MKMapView {
        let mapView = MKMapView()
        mapView.delegate = context.coordinator
        
        // Add tap gesture recognizer
        let tapGesture = UITapGestureRecognizer(target: context.coordinator, action: #selector(Coordinator.handleTap(_:)))
        mapView.addGestureRecognizer(tapGesture)
        
        return mapView
    }
    
    func updateUIView(_ mapView: MKMapView, context: Context) {
        mapView.setRegion(region, animated: true)
        
        // Update annotations
        mapView.removeAnnotations(mapView.annotations)
        if let coordinate = annotationCoordinate {
            let annotation = MKPointAnnotation()
            annotation.coordinate = coordinate
            mapView.addAnnotation(annotation)
        }
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, MKMapViewDelegate {
        var parent: MapViewWithTap
        
        init(_ parent: MapViewWithTap) {
            self.parent = parent
        }
        
        @objc func handleTap(_ gesture: UITapGestureRecognizer) {
            let mapView = gesture.view as! MKMapView
            let point = gesture.location(in: mapView)
            let coordinate = mapView.convert(point, toCoordinateFrom: mapView)
            parent.onTap(coordinate)
        }
    }
}

struct MapLocation: Identifiable {
    let id = UUID()
    let coordinate: CLLocationCoordinate2D
}

struct ReportView: View {
    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 28.4657683, longitude: -81.4729034),
        span: MKCoordinateSpan(latitudeDelta: 0.5, longitudeDelta: 0.5)
    )
    @State private var markerLocation: MapLocation?
    @State private var latitudeText: String = "28.46576830"
    @State private var longitudeText: String = "-81.47290340"
    @State private var countryCode: String = "US"
    @State private var reefName: String = ""
    @State private var reefType: String = ""
    @State private var depth: String = ""
    @State private var temperature: String = ""
    @State private var title: String = ""
    @State private var description: String = ""
    @State private var selectedDate: Date = Date()
    @State private var selectedPhotos: [PhotosPickerItem] = []
    @State private var selectedImagesData: [Data] = []
    @State private var showAlert: Bool = false
    @State private var alertMessage: String = ""
    @FocusState private var focusedField: Field?
    @EnvironmentObject var globalData: GlobalData
    
    enum Field {
        case latitude, longitude, reefName, depth, temperature, title, description
    }
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                // Header
                HStack {
                    Image(systemName: "doc.text")
                        .foregroundColor(.blue)
                    Text("Submit New Report")
                        .font(.title2)
                        .fontWeight(.semibold)
                }
                
                Text("Help us track and monitor coral health by submitting your observations")
                    .foregroundColor(.gray)
                
                // Location Details Section
                VStack(alignment: .leading, spacing: 16) {
                    HStack {
                        Image(systemName: "location.circle")
                            .foregroundColor(.blue)
                        Text("Location Details")
                            .font(.headline)
                    }
                    
                    MapViewWithTap(
                        region: $region,
                        onTap: { coordinate in
                            markerLocation = MapLocation(coordinate: coordinate)
                            latitudeText = String(format: "%.8f", coordinate.latitude)
                            longitudeText = String(format: "%.8f", coordinate.longitude)
                        },
                        annotationCoordinate: markerLocation?.coordinate
                    )
                    .frame(height: 300)
                    .cornerRadius(8)
                    
                    HStack(spacing: 16) {
                        VStack(alignment: .leading) {
                            Text("Latitude*")
                                .foregroundColor(.gray)
                            TextField("", text: $latitudeText)
                                .textFieldStyle(.roundedBorder)
                                .focused($focusedField, equals: .latitude)
                        }
                        
                        VStack(alignment: .leading) {
                            Text("Longitude*")
                                .foregroundColor(.gray)
                            TextField("", text: $longitudeText)
                                .textFieldStyle(.roundedBorder)
                                .focused($focusedField, equals: .longitude)
                        }
                        
                        VStack(alignment: .leading) {
                            Text("Country Code*")
                                .foregroundColor(.gray)
                            HStack {
                                Image(systemName: "globe")
                                    .foregroundColor(.gray)
                                Text(countryCode)
                            }
                            .padding(8)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                        }
                    }
                }
                
                // Reef Info Section
                VStack(alignment: .leading, spacing: 16) {
                    HStack {
                        Image(systemName: "water.waves")
                            .foregroundColor(.blue)
                        Text("Reef Info")
                            .font(.headline)
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Reef Name")
                            .foregroundColor(.gray)
                        TextField("Enter the name of the reef where the coral was found", text: $reefName)
                            .textFieldStyle(.roundedBorder)
                            .focused($focusedField, equals: .reefName)
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Reef Type")
                            .foregroundColor(.gray)
                        Text("If known, on what reef type did you perform your survey?")
                            .font(.caption)
                            .foregroundColor(.gray)
                        Menu {
                            Button("Barrier Reef") { reefType = "Barrier Reef" }
                            Button("Fringing Reef") { reefType = "Fringing Reef" }
                            Button("Patch Reef") { reefType = "Patch Reef" }
                            Button("Atoll") { reefType = "Atoll" }
                        } label: {
                            HStack {
                                Text(reefType.isEmpty ? "Select Reef Type" : reefType)
                                    .foregroundColor(reefType.isEmpty ? .gray : .black)
                                Spacer()
                                Image(systemName: "chevron.down")
                                    .foregroundColor(.gray)
                            }
                            .padding(8)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                        }
                        
                        TextField("If not listed, please specify", text: $reefType)
                            .textFieldStyle(.roundedBorder)
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Average Depth (m)")
                            .foregroundColor(.gray)
                        Text("If known, the approximate average depth of the observations?")
                            .font(.caption)
                            .foregroundColor(.gray)
                        TextField("", text: $depth)
                            .textFieldStyle(.roundedBorder)
                            .focused($focusedField, equals: .depth)
                            .keyboardType(.decimalPad)
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Water Temperature (c)")
                            .foregroundColor(.gray)
                        Text("If known, the approximate water temperature during the observation?")
                            .font(.caption)
                            .foregroundColor(.gray)
                        TextField("", text: $temperature)
                            .textFieldStyle(.roundedBorder)
                            .focused($focusedField, equals: .temperature)
                            .keyboardType(.decimalPad)
                    }
                }
                
                // Report Details Section
                VStack(alignment: .leading, spacing: 16) {
                    HStack {
                        Image(systemName: "doc.text.fill")
                            .foregroundColor(.blue)
                        Text("Report Details")
                            .font(.headline)
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Title")
                            .foregroundColor(.gray)
                        TextField("Enter Report Title", text: $title)
                            .textFieldStyle(.roundedBorder)
                            .focused($focusedField, equals: .title)
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Date of Discovery*")
                            .foregroundColor(.gray)
                        DatePicker("", selection: $selectedDate, displayedComponents: .date)
                            .labelsHidden()
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Photo Upload")
                            .foregroundColor(.gray)
                        PhotosPicker(
                            selection: $selectedPhotos,
                            maxSelectionCount: 5,
                            matching: .images
                        ) {
                            HStack {
                                Image(systemName: "photo.on.rectangle.angled")
                                Text("Add Photos")
                                Spacer()
                                Text("\(selectedPhotos.count) photo selected")
                                    .foregroundColor(.gray)
                            }
                            .padding(8)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                        }
                        Text("Images will be resized to 500X500")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Description")
                            .foregroundColor(.gray)
                        Text("Please provide a detailed description of your discovery...")
                            .font(.caption)
                            .foregroundColor(.gray)
                        TextEditor(text: $description)
                            .frame(height: 100)
                            .padding(4)
                            .overlay(
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(Color(.systemGray4))
                            )
                            .focused($focusedField, equals: .description)
                    }
                }
                
                // Footer Buttons
                HStack(spacing: 16) {
                    Button(action: clearForm) {
                        Text("Clear Form")
                            .foregroundColor(.blue)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .overlay(
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(Color.blue)
                            )
                    }
                    
                    Button(action: submitReport) {
                        Text("Submit Form")
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .cornerRadius(8)
                    }
                }
            }
            .padding(24)
        }
        .toolbar {
            ToolbarItemGroup(placement: .keyboard) {
                Spacer()
                Button("Done") {
                    focusedField = nil
                }
            }
        }
        .onChange(of: selectedPhotos) { _ in
            Task {
                selectedImagesData.removeAll()
                for item in selectedPhotos {
                    if let data = try? await item.loadTransferable(type: Data.self) {
                        selectedImagesData.append(data)
                    }
                }
            }
        }
        .alert(isPresented: $showAlert) {
            Alert(title: Text("Report Status"), message: Text(alertMessage), dismissButton: .default(Text("OK")))
        }
    }
    
    private func updateMarkerFromText() {
        if let lat = Double(latitudeText),
           let lon = Double(longitudeText),
           lat >= -90 && lat <= 90,
           lon >= -180 && lon <= 180 {
            let coordinate = CLLocationCoordinate2D(latitude: lat, longitude: lon)
            markerLocation = MapLocation(coordinate: coordinate)
            region.center = coordinate
        }
    }
    
    private func clearForm() {
        reefName = ""
        reefType = ""
        depth = ""
        temperature = ""
        title = ""
        description = ""
        selectedPhotos = []
        selectedImagesData = []
        selectedDate = Date()
    }
    
    private func submitReport() {
        // Validate required fields
        guard let location = markerLocation else {
            alertMessage = "Please select a location"
            showAlert = true
            return
        }
        
        guard !reefName.isEmpty, !depth.isEmpty, !temperature.isEmpty, !title.isEmpty else {
            alertMessage = "Please fill in all required fields"
            showAlert = true
            return
        }
        
        // Ensure the user is logged in (userID is available)
        guard let userId = globalData.userId else {
            alertMessage = "You must be logged in to submit a report."
            showAlert = true
            return
        }
        
        // Prepare the report data
        let report = ReportRequest(
            userId: userId,
            latitude: location.coordinate.latitude,
            longitude: location.coordinate.longitude,
            countryCode: countryCode,
            description: description,
            reportDate: selectedDate,
            title: title,
            reefName: reefName,
            reefType: reefType,
            averageDepth: Int(depth) ?? 0,
            waterTemp: Int(temperature) ?? 0
        )
        
        // Send the report data to the backend
        guard let url = URL(string: "http://172.20.10.8:8080/reports") else {
            alertMessage = "Invalid URL."
            showAlert = true
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        do {
            let jsonData = try JSONEncoder().encode(report)
            request.httpBody = jsonData
        } catch {
            alertMessage = "Failed to encode report data."
            showAlert = true
            return
        }
        
        // Send the request
        URLSession.shared.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                if let error = error {
                    alertMessage = "Error: \(error.localizedDescription)"
                    showAlert = true
                    return
                }
                
                guard let httpResponse = response as? HTTPURLResponse else {
                    alertMessage = "Invalid response from server."
                    showAlert = true
                    return
                }
                
                if httpResponse.statusCode == 200 {
                    alertMessage = "Report submitted successfully!"
                    showAlert = true
                    clearForm()
                } else {
                    alertMessage = "Failed to submit report. Status code: \(httpResponse.statusCode)"
                    showAlert = true
                }
            }
        }.resume()
    }
}

struct ReportRequest: Codable {
    let userId: UUID
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

    // Map Swift property names to JSON keys
    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case latitude
        case longitude
        case countryCode = "country_code"
        case description
        case reportDate = "report_date"
        case title
        case reefName = "reef_name"
        case reefType = "reef_type"
        case averageDepth = "average_depth"
        case waterTemp = "water_temp"
    }

    // Custom encoding to convert `reportDate` to a string
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(userId, forKey: .userId)
        try container.encode(latitude, forKey: .latitude)
        try container.encode(longitude, forKey: .longitude)
        try container.encode(countryCode, forKey: .countryCode)
        try container.encodeIfPresent(description, forKey: .description)
        
        // Convert `reportDate` to an ISO 8601 string
        let dateFormatter = ISO8601DateFormatter()
        let reportDateString = dateFormatter.string(from: reportDate)
        try container.encode(reportDateString, forKey: .reportDate)
        
        try container.encode(title, forKey: .title)
        try container.encodeIfPresent(reefName, forKey: .reefName)
        try container.encodeIfPresent(reefType, forKey: .reefType)
        try container.encode(averageDepth, forKey: .averageDepth)
        try container.encode(waterTemp, forKey: .waterTemp)
    }
}
