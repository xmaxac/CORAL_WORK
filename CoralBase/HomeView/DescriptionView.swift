//
//  Description.swift
//  CoralBase
//
//  Created by Shohruh Ismatulla on 12/21/24.
//

import SwiftUI
import MapKit

struct DescriptionView: View {
    let object: LocationObject
    var body: some View {
        NavigationStack{
            ScrollView{
                VStack{
                    Image(object.image)
                        .resizable()
                        .scaledToFill()
                        .cornerRadius(12)
                    
                    Text(object.description)
                    
                    VStack{
                        MapView(Latitude: object.latitude, Longitude: object.longitude, name: object.title, abbreviation: object.abbreviation)
                    }
                    .cornerRadius(12)
                    .frame(height: 500)
                }
                .padding()
            }
            .navigationTitle(object.title)
        }
    }
}

#Preview {
    DescriptionView(object: LocationObject(title: "Hello", location: "Florida", image: "Florida", description: "Florida is very skibidi", latitude: 23.34, longitude: 43.23, abbreviation: "MEW"))
}
