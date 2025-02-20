//
//  OverView.swift
//  CoralBase
//
//  Created by Shohruh Ismatulla on 2/12/25.
//

import SwiftUI

struct OverView: View {
    var body: some View {
        NavigationStack {
            
            ScrollView{
               
                VStack{
                    Text("What is SCTLD?")
                        .fontWeight(.bold)
                        .frame(alignment: .center)
            
                       
                    
                    Text("SCTLD (Stony Coral Tissue Loss Disease) is a highly lethal coral disease that was first identified off the coast of Miami, Florida in 2014. The disease appears as rapidly spreading white lesions on coral colonies that can kill entire coral colonies within weeks or months. It affects over 20 different species of hard corals, with some species like brain corals and pillar corals being particularly susceptible. Unlike some other coral diseases, SCTLD has proven to be unusually persistent and virulent, spreading throughout the Caribbean Sea and causing unprecedented coral mortality rates. Scientists believe it is caused by bacterial pathogens, though the exact cause remains under investigation. The disease has had devastating impacts on coral reef ecosystems, with some areas experiencing up to 60-100% mortality of susceptible species, leading to significant ecological and economic consequences for affected regions.")
                        .foregroundColor(.gray)

                    Text("Economic Impact")
                        .foregroundColor(.black)
                        .padding(.top, 20)
                        .fontWeight(.bold)
                        .frame(alignment: .center)
                    
                    Text("Tourism revenue losses estimated at millions annually")
                    Text("Decreased fisheries productivity")
                    Text("Increased coastal protection costs")
                    
                    Text("Ecological Impact")
                        .foregroundColor(.black)
                        .padding(.top, 20)
                        .fontWeight(.bold)
                        .frame(alignment: .center)
                    
                    Text("Reduced reef biodiversity")
                    Text("Loss of critical fish habitat")
                    Text("Weakened Costal Protection")
                    
                    Text("Timeline of SCTLD")
                        .foregroundColor(.black)
                        .padding(.top, 20)
                        .fontWeight(.bold)
                        .frame(alignment: .center)
                    
                    VStack(alignment: .leading, spacing: 20) {
                                Text("2014")
                                    .foregroundColor(.blue)
                                Text("First reported in Florida's Miami-Dade County")
                                    .foregroundColor(.black)
                                Text("2016")
                                    .foregroundColor(.blue)
                                Text("Spread to the Florida Keys")
                                    .foregroundColor(.black)
                                Text("2018")
                            .       foregroundColor(.blue)
                                Text("Reached Caribbean islands")
                                    .foregroundColor(.black)
                                Text("Present")
                            .       foregroundColor(.blue)
                                Text("Continued spread and ongoing research efforts")
                                    .foregroundColor(.black)
                                
                            }
                            .padding()
                            .overlay(
                                Rectangle() // Left border
                                    .frame(width: 2) // Width of the border
                                    .foregroundColor(.blue),
                                alignment: .leading // Align to the left side
                            )
                        
                    
      
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
    OverView()
}

struct BulletPoints: View {
    let text: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Text("•") // Bullet point
                .font(.headline)
                .foregroundColor(.blue)
            Text(text)
                .font(.body)
                .foregroundColor(.primary)
        }
    }
}
