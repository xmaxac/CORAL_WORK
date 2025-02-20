//
//  MapView.swift
//  CoralBase
//
//  Created by Shohruh Ismatulla on 11/16/24.
//

import MapKit
import SwiftUI

struct MapGeneralView: View {
    let florida = CLLocationCoordinate2D(latitude:25.74182, longitude: -80.23621)
    let puerto_rico = CLLocationCoordinate2D(latitude:18.426600, longitude: -66.064200)
//  ° N, 80.23621° W
    
    @State var camera: MapCameraPosition = .automatic
    
    var body: some View {
        Map(position: $camera){
            Marker("Florida", monogram: Text("Fl"), coordinate: florida)
                .tint(.blue)
            Marker("Puerto Rico", monogram: Text("PR"), coordinate: puerto_rico)
                .tint(.blue)
        }

    }
}

#Preview {
    MapGeneralView()
}
