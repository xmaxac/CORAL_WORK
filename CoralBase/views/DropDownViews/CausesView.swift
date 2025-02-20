//
//  CausesView.swift
//  CoralBase
//
//  Created by Shohruh Ismatulla on 2/12/25.
//

import SwiftUI

struct CausesView: View {
    var body: some View {
        NavigationStack {
            
            ScrollView{
               
                VStack{
                    Text("Causes and Transmission")
                        .fontWeight(.bold)
                        
            
                       
                    
                    Text("Understanding how SCTLD spreads is crucial for controlling its impact on reef ecosystems.")
                        .foregroundColor(.gray)

                    Text("Direct Contact")
                        .foregroundColor(.black)
                        .padding(.top, 20)
                        .fontWeight(.bold)
                        
                    
                    Text("When diseased corals physically touch healthy corals, the disease can transfer directly between colonies. This often happens in dense reef areas where colonies grow close together.")
                        
                    
                    Text("Water Transmission")
                        .foregroundColor(.black)
                        .padding(.top, 20)
                        .fontWeight(.bold)
                        
                    
                    Text("The disease pathogens can move through seawater, allowing SCTLD to infect corals without direct contact.")
                        
                    
                    Text("Jump across gaps in the reef")
                    Text("Spread over longer distances via ocean currents")
                    Text("Potentially be transmitted through ballast water in ships")
                    
                    Text("Sediment Transport")
                        .foregroundColor(.black)
                        .padding(.top, 20)
                        .fontWeight(.bold)
                        
                    
                    Text("There's evidence that the disease-causing bacteria can survive in seafloor sediments, which can then be stirred up by:")
                        
                    
                    Text("Storm events")
                    Text("Wave action")
                    Text("Human activities like dredging")
                    Text("Ship Traffic")
                    
                    Text("Secondary Vectors")
                        .foregroundColor(.black)
                        .padding(.top, 20)
                        .fontWeight(.bold)
                        
                    
                    Text("While not fully confirmed, researchers suspect that certain marine organisms might help spread the disease by:")
                        
                    
                    Text("Moving between infected and healthy corals")
                    Text("Carrying disease-causing agents on their bodies")
                    Text("Potentially feeding on diseased coral tissue and then visiting healthy colonies")
                    
                    Text("Contributing Factors")
                        .foregroundColor(.black)
                        .padding(.top, 20)
                        .fontWeight(.bold)
                    Collapsible(title: "Climate Change Impact", content: "Increased water temperatures; Ocean acidification; Changed water chemistry")
                    Collapsible(title: "Human Activities", content: "Costal Development; Water Pollution; Marine Traffic")
                        
                    
                    Text("Research Resources")
                        .foregroundColor(.black)
                        .padding(.top, 20)
                        .fontWeight(.bold)
                    
                    HStack{
                        Text("Latest Scientific Studies")
                        Image(systemName: "square.and.arrow.down")
                        Text("Download Research Summary")
                    }
                    .foregroundColor(.blue)
                        
                    
      
                }
                .padding(25)
                    Spacer() // Push content up
            }
            
            
        }
        .background(.white)
        .cornerRadius(12)
        .shadow(radius: 12)
    }
       
}

#Preview {
    CausesView()
}

struct Collapsible: View {
    var title: String
    var content: String
    
    @State private var isExpanded: Bool = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // Header (Title)
            HStack {
                Text(title)
                    .font(.headline)
                    .foregroundColor(.primary)
                
                Spacer()
                
                Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                    .foregroundColor(.blue)
                    .font(.system(size: 14, weight: .bold))
            }
            .contentShape(Rectangle()) // Make the entire HStack tappable
            .onTapGesture {
                withAnimation {
                    isExpanded.toggle() // Toggle expansion state
                }
            }
            
            // Content (Collapsible)
            if isExpanded {
                Text(content)
                    .font(.body)
                    .foregroundColor(.secondary)
                    .transition(.opacity) // Add a fade animation
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(10)
        .shadow(color: .black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
}


