//
//  CoralView.swift
//  CoralBase
//
//  Created by Shohruh Ismatulla on 11/14/24.
//

import SwiftUI

struct BigButton: View {
    let name: String
    let description: String
    let image: String
    var body: some View {
        NavigationLink(destination: MapGeneralView()){
            VStack(alignment: .leading){
                Text(name)
                    .fontWeight(.bold)
                    .font(.title2)
                Text(description)
                    .multilineTextAlignment(.leading)
                Image(image)
                    .scaledToFit()
                    .clipped()
                    .cornerRadius(12)
                
            }
            .foregroundColor(.white)
            .padding()
            .background(Color.blue)
            .cornerRadius(12)
            .padding(6)
            .shadow(color: .black, radius: 1, x: 0, y: 0)
        }
    
       
    }
}

#Preview {
    BigButton(name: "View our map", description: "Our map contains lots of new information about where to find stony corals and which places can help with that", image: "MAP")
}
