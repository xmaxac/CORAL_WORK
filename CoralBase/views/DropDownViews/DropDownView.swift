//
//  DropDownView.swift
//  CoralBase
//
//  Created by Shohruh Ismatulla on 2/12/25.
//

import SwiftUI

struct DropDownView: View {
    @State private var selectedOption: String = "Overview"
    @State private var selectedView: AnyView = AnyView(OverView())
    
    let options = ["Overview", "Causes", "Affected", "Treatment"]
    
    var body: some View {
        VStack {
            // Dropdown Menu
            Menu {
                ForEach(options, id: \.self) { option in
                    Button(action: {
                        selectedOption = option
                        updateSelectedView(for: option)
                    }) {
                        Text(option)
                    }
                }
            } label: {
                HStack {
                    Text(selectedOption)
                        .foregroundColor(.white)
                        .font(.headline)
                    
                    Spacer()
                    
                    Image(systemName: "chevron.down")
                        .foregroundColor(.white)
                        .font(.system(size: 14, weight: .bold))
                }
                .padding()
                .background(Color.blue)
                .cornerRadius(10)
                .shadow(color: .black.opacity(0.1), radius: 5, x: 0, y: 2)
            }
            .padding()
            
            // Display the selected view
            selectedView
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .padding()
            
            Spacer()
        }
        .padding()
    }
    
    // Function to update the selected view based on the selected option
    private func updateSelectedView(for option: String) {
        switch option {
        case "Overview":
            selectedView = AnyView(OverView())
        case "Causes":
            selectedView = AnyView(CausesView())
        case "Affected":
            selectedView = AnyView(AffectedView())
        case "Treatment":
            selectedView = AnyView(TreatmentView())
        default:
            selectedView = AnyView(OverView()) // Default to Overview
        }
    }
}

// Example views for demonstration


struct DropDownView_Previews: PreviewProvider {
    static var previews: some View {
        DropDownView()
    }
}
