import SwiftUI

struct ViewSwitcher: View {
    @State private var isNavBarExpanded: Bool = true
    @StateObject var globalData = GlobalData()
    
    let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
    
    var body: some View {
        NavigationStack {
            ZStack {
                // Background tap to collapse navbar
                Color.clear
                    .contentShape(Rectangle())
                    .onTapGesture {
                        withAnimation(.spring(response: 0.5, dampingFraction: 0.7, blendDuration: 0.5)) {
                            isNavBarExpanded = false
                        }
                    }
                
                // Views
                Group {
                    switch globalData.count {
                    case 1: HomeView()
                            .environmentObject(globalData)
                    case 2: InfoView()
                            .environmentObject(globalData)
                    case 3: CommunityView()
                            .environmentObject(globalData)
                    case 4: ReportView()
                            .environmentObject(globalData)
                    case 5: DetectView()
                            .environmentObject(globalData)
                    case 6: SignUpView()
                            .environmentObject(globalData)
                    case 7: LoginView()
                            .environmentObject(globalData)
                    case 8: ProfileView()
                            .environmentObject(globalData)
                    case 9: ReportView()
                            .environmentObject(globalData)
                    default: HomeView()
                            .environmentObject(globalData)
                    }
                }
                
                VStack {
                    Spacer()
                    
                    if isNavBarExpanded {
                        HStack {
                            Button(action: { selectTab(1) }) {
                                navButton(buttonImg: "house", buttonText: "Home", isSelected: globalData.count == 1)
                            }
                            Button(action: { selectTab(2) }) {
                                navButton(buttonImg: "info.bubble", buttonText: "Info", isSelected: globalData.count == 2)
                            }
                            Button(action: { selectTab(3) }) {
                                navButton(buttonImg: "person.3.fill", buttonText: "Groups", isSelected: globalData.count == 3)
                            }
                            Button(action: { selectTab(4) }) {
                                navButton(buttonImg: "books.vertical.fill", buttonText: "Data", isSelected: globalData.count == 4)
                            }
                            Button(action: { selectTab(5) }) {
                                navButton(buttonImg: "arrow.up.document.fill", buttonText: "Detect", isSelected: globalData.count == 5)
                            }
                        }
                        .padding(6)
                        .background(Color.white)
                        .cornerRadius(22)
                        .shadow(color: .gray, radius: 10, x: 0, y: 0)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                    }
                    
                    // Floating button to expand navbar
                    Button(action: {
                        withAnimation(.spring(response: 0.5, dampingFraction: 0.7, blendDuration: 0.5)) {
                            isNavBarExpanded.toggle()
                        }
                    }) {
                        Image(systemName: isNavBarExpanded ? "chevron.down.circle.fill" : "chevron.up.circle.fill")
                            .resizable()
                            .frame(width: 50, height: 50)
                            .foregroundColor(.blue)
                            .background(Circle().fill(Color.white).shadow(radius: 5))
                    }
                    .offset(x: UIScreen.main.bounds.width / 2 - 50, y: 30)
                    .padding(.bottom, 20)
                    .transition(.move(edge: .trailing).combined(with: .opacity))
                }
            }
            .navigationTitle("Coral Base") // Add navigation title
            .toolbar {
                if globalData.count != 6  || globalData.count != 8 { // Check if not on SignUpView
                    ToolbarItem(placement: .navigationBarTrailing) {
                        
                        HStack {
                            Button(action: { selectTab(9) }) { // Changed to select tab 4 for ReportView
                                Text("New Report +")
                                    .foregroundColor(.white)
                                    .padding(.trailing, 10)
                            }
                            .frame(width: 125, height: 40, alignment: .center)
                            .background(.black)
                            .cornerRadius(6)
                            
                            if globalData.isLoggedIn {
                                Button(action: { selectTab(8) }) {
                                    Image(systemName: "person.fill")
                                        .foregroundColor(.blue)
                                }
                            } else if globalData.count != 7 { // Only show if not on LoginView
                                Button(action: { selectTab(6) }) {
                                    Text("Sign Up")
                                        .foregroundColor(.white)
                                        .padding(.trailing, 10)
                                }
                                .frame(width: 100, height: 40, alignment: .center)
                                .background(.black)
                                .cornerRadius(6)
                            }
                            
                        }
                    }
                }
            }
        }
    }
    
    private func selectTab(_ tab: Int) {
        withAnimation(.spring()) {
            globalData.count = tab
            impactFeedback.impactOccurred()
        }
    }

    struct navButton: View {
        let buttonImg: String
        let buttonText: String
        let isSelected: Bool
        
        var body: some View {
            VStack {
                Image(systemName: buttonImg)
                Text(buttonText)
            }
            .padding(10)
            .foregroundColor(isSelected ? Color.white : Color.blue)
            .background(isSelected ? Color.blue : Color.white)
            .cornerRadius(20)
        }
    }
}
