import SwiftUI

struct HomeView: View {
    var body: some View {
        
            ScrollView{
                VStack{
                    Text("Unified Stony Coral Tissue Loss Disease Monitoring Platform")
                        .fontWeight(.bold)
                        .font(.system(size: 48))
                    Text("Join the global community tracking Stony Coral Tissue Loss Disease (SCTLD). Log observations, analyze data, and collaborate with researchers worldwide to protect coral reef ecosystems.")
                        .foregroundColor(.gray)
                        .font(.system(size: 20))
                    
                    
                    
                    TitleBoxes(icon: "map", title: "Global Disease Mapping", subtitle: "Track the spread of SCTLD")
                    
                    TitleBoxes(icon: "camera", title: "Data Analytics Tools", subtitle: "Unified Coral Health Monitoring")
                    
                    TitleBoxes(icon: "camera", title: "Automated Detection", subtitle: "AI-powered disease analysis")
                    
                    TitleBoxes(icon: "bubble", title: "Research Community", subtitle: "Discover and connect with the global community monitoring Stony Coral Tissue Loss Disease.")
                    
                    
                   
                    
                    
                    
                        
                }
                .padding(25)
                .padding(.bottom, 100)
                
                    
                    
                    Spacer() // Push content up
                
                
                
                
            }
            
    }
       
}

#Preview {
    HomeView()
}

struct TitleBoxes: View {
    let icon: String
    let title: String
    let subtitle: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 24))
                .foregroundColor(.blue)
            
            VStack(alignment: .leading, spacing: 8) {
                Text(title)
                    .font(.system(size: 16, weight: .bold))
                
                Text(subtitle)
                    .font(.system(size: 14, weight: .regular))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(24)
        .background(Color(.systemGray6))
        .cornerRadius(16)
    }
}
