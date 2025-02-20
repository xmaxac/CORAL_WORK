//
//  MapView.swift
//  CoralBase
//
//  Created by Shohruh Ismatulla on 11/16/24.
//

import SwiftUI
import MapKit


struct MapView: View {
    let Latitude: Double
    let Longitude: Double
    let name: String
    let abbreviation: String
    
    
    var florida: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: Latitude, longitude: Longitude)
    }
    
    @State var camera: MapCameraPosition = .region(
        MKCoordinateRegion(
            center: CLLocationCoordinate2D(latitude: 25.74182, longitude: -80.23621),
            span: MKCoordinateSpan(latitudeDelta: 0.5, longitudeDelta: 0.5) // Adjust for zoom level
        )
    )
    
    var body: some View {
        Map(position: $camera) {
            Marker(name, monogram: Text(abbreviation), coordinate: florida)
                .tint(.blue)

        }
        .onAppear {
            // Center on Florida when the map appears
            camera = .region(
                MKCoordinateRegion(
                    center: florida,
                    span: MKCoordinateSpan(latitudeDelta: 2, longitudeDelta: 2) // Adjust zoom here
                )
            )
        }
    }
}

#Preview {
    MapView(Latitude: 25.74182, Longitude: -80.23621, name: "Florida", abbreviation: "Fl")
}
