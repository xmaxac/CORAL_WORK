//
//  InfoView.swift
//  CoralBase
//
//  Created by Shohruh Ismatulla on 2/12/25.
//

import SwiftUI

struct InfoView: View {
    var body: some View {
            ScrollView{
               
                VStack{
                    VStack{
                        Text("Understanding Stony Coral Tissue Loss Disease")
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                            .frame(alignment: .center)
                            .font(.system(size: 48))
                        
                        
                        Text("Join the fight against one of the most lethal coral diseases threatening our reefs")
                            .foregroundColor(.white)
                            .font(.system(size: 20))
                            .padding(30)
                        
                        HStack{
                            NavigationLink(destination: LoginView()) {
                                Text("Report SCTLD")
                                    .foregroundColor(.white)
                                    .padding(10)
                                
                            }
                            .background(.blue)
                            .cornerRadius(6)
                            
                            NavigationLink(destination: LoginView()) {
                                Text("Learn More")
                                    .foregroundColor(.blue)
                                    .padding(10)
                                
                            }
                            .background(.white)
                            .cornerRadius(6)
                        }
                        
                        
                    }
                    .ignoresSafeArea()
                    .frame(width: 400, height: 600, alignment: .center)
                    .background(
                        ZStack {
                            Color.white
                            Image("background")
                                .resizable()
                                .scaledToFill()
                                .clipped()
                            Color.blue
                                .opacity(0.5)
                                .blendMode(.multiply)
                        }
                    )  
                    DropDownView()
                        
                }
                .padding(25)
                    Spacer() // Push content up
            }
    }
       
}

#Preview {
    InfoView()
}

