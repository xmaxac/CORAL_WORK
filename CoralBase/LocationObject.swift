//
//  LocationObject.swift
//  CoralBase
//
//  Created by Shohruh Ismatulla on 11/15/24.
//
/****/
import Foundation


struct LocationObject: Identifiable {
    let id: UUID
    var title: String
    var location: String
    let image: String
    let description: String
    let latitude: Double
    let longitude: Double
    let abbreviation: String
    
    init(id: UUID = UUID(), title: String, location: String, image: String, description: String, latitude: Double, longitude: Double, abbreviation: String){
        self.id=id
        self.title=title
        self.location=location
        self.image=image
        self.description = description
        self.latitude = latitude
        self.longitude = longitude
        self.abbreviation = abbreviation
        
    }
    
}


extension LocationObject {
    static var sampleData: [LocationObject] {
        [
            LocationObject(title: "Florida", location:"Florida", image: "Florida", description: "Florida is one of the areas that's been affected by Stony coral tissue disease, it has a lot of places where Stony coral tissue is growing and it's affecting the coral reefs", latitude: 25.74182, longitude: -80.23621, abbreviation: "Fl"),
            LocationObject(title: "Carribean", location:"Carribean", image: "Carribean" ,description: "Florida is one of the areas that's been affected by Stony coral tissue disease, it has a lot of places where Stony coral tissue is growing and it's affecting the coral reefs", latitude: 25.74182, longitude: -80.23621, abbreviation: "CAR"),
            LocationObject(title: "Puerto Rico", location:"Puerto Rico", image: "Puerto Rico" ,description: "Florida is one of the areas that's been affected by Stony coral tissue disease, it has a lot of places where Stony coral tissue is growing and it's affecting the coral reefs", latitude:18.426600, longitude: -66.064200, abbreviation: "PR"),
        ]
    }
    static var companies: [LocationObject] {
        [
            LocationObject(title: "UVI", location:"Marilyn E Brandt", image: "UVirginIslands", description: "Florida is one of the areas that's been affected by Stony coral tissue disease, it has a lot of places where Stony coral tissue is growing and it's affecting the coral reefs", latitude: 25.74182, longitude: -80.23621, abbreviation: "UVI"),
            LocationObject(title: "FKNMS", location:"Carribean", image: "FKNMS" ,description: "Florida is one of the areas that's been affected by Stony coral tissue disease, it has a lot of places where Stony coral tissue is growing and it's affecting the coral reefs", latitude: 25.74182, longitude: -80.23621, abbreviation: "FKNMS"),
            LocationObject(title: "FDEP", location:"Florida", image: "FDEP", description: "Florida is one of the areas that's been affected by Stony coral tissue disease, it has a lot of places where Stony coral tissue is growing and it's affecting the coral reefs", latitude: 25.74182, longitude: -80.23621, abbreviation: "FDEP"),
        ]
    }
}

