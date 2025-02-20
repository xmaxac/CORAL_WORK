import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var globalData: GlobalData
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header with back button and name
            HStack {
                Button(action: {
                    presentationMode.wrappedValue.dismiss()
                }) {
                    Image(systemName: "arrow.left")
                        .foregroundColor(.black)
                        .padding()
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(globalData.fullName ?? "Shohruh Ismatulla")
                        .font(.headline)
                        .fontWeight(.bold)
                    
                    Text("@\(globalData.userName ?? "Hello")")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
                
                Spacer()
            }
            .padding(.vertical, 8)
            
            // Dark gray banner area
            ZStack(alignment: .topTrailing) {
                Rectangle()
                    .fill(Color(UIColor.darkGray))
                    .frame(height: 180)
                
                // Edit button in top corner
                Button(action: {}) {
                    Image(systemName: "pencil")
                        .foregroundColor(.white)
                        .padding(8)
                        .background(Circle().fill(Color.black.opacity(0.5)))
                        .padding()
                }
            }
            
            // Profile image
            HStack {
                ZStack {
                    Circle()
                        .fill(Color(UIColor.lightGray))
                        .frame(width: 80, height: 80)
                        .overlay(
                            Circle()
                                .stroke(Color.white, lineWidth: 3)
                        )
                    
                    // Default profile icon
                    VStack(spacing: 0) {
                        Circle()
                            .fill(Color.white)
                            .frame(width: 26, height: 26)
                        
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Color.white)
                            .frame(width: 40, height: 20)
                    }
                }
                .offset(y: -40)
                .padding(.leading, 16)
                
                Spacer()
                
                // Edit Profile button
                Button(action: {}) {
                    Text("Edit Profile")
                        .font(.footnote)
                        .foregroundColor(.black)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(Color.gray, lineWidth: 1)
                        )
                }
                .padding(.trailing, 16)
                .offset(y: -40)
            }
            
            // Name section
            VStack(alignment: .leading, spacing: 2) {
                // Added spacing to account for negative offset of profile picture
                Spacer().frame(height: 20)
                
                Text(globalData.fullName ?? "Shohruh Ismatulla")
                    .font(.title3)
                    .fontWeight(.bold)
                
                Text("@\(globalData.userName ?? "Hello")")
                    .foregroundColor(.gray)
                    .padding(.bottom, 8)
                
                HStack {
                    Image(systemName: "calendar")
                        .foregroundColor(.gray)
                        .font(.footnote)
                    Text("Joined on 2/19/2025")
                        .foregroundColor(.gray)
                        .font(.footnote)
                }
            }
            .padding(.horizontal, 16)
            .offset(y: -40)
            
            Spacer()
        }
        .edgesIgnoringSafeArea(.top)
    }
}
