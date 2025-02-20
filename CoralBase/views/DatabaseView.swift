//
//  ContentView.swift
//  CoralBase
//
//  Created by Shohruh Ismatulla on 11/13/24.
//

import SwiftUI

struct DatabaseView: View {
    var body: some View {
        
                ScrollView{
                    Text("Databases")
                        .fontWeight(.bold)
                        .font(.largeTitle)
                    VStack (spacing: 200){
                            Text("Here's all the databases")
                                
                    }
                    
                }
        
    }
        
    
}

#Preview {
    DatabaseView()
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
