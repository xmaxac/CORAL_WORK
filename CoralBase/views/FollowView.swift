//
//  ContentView.swift
//  CoralBase
//
//  Created by Shohruh Ismatulla on 11/13/24.
//

import SwiftUI

struct FollowView: View {
    var body: some View {
        
                ScrollView{
                    Text("Follow View")
                        .fontWeight(.bold)
                        .font(.largeTitle)
                    VStack{
                            Text("Follow us on youtube, instagram, and tiktok")
                        
                                
                    }
                    
                }
        
    }
        
    
}

#Preview {
    FollowView()
}

/***
 NavigationView{
     VStack{
         ScrollView{
             Text("Coral Base")
                 .fontWeight(.bold)
                 .font(.largeTitle)
                 
             VStack (spacing: 200){
                     Text("Image Goes Here")
                         
             }
             .background(Color.white)
         }
         navigationBar()
     }
 }
 
 */
