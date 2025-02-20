//
//  CoralBaseApp.swift
//  CoralBase
//
//  Created by Shohruh Ismatulla on 11/13/24.
//

import SwiftUI

@main
struct CoralBaseApp: App {
    @StateObject private var globalData = GlobalData()
    
    var body: some Scene {
        WindowGroup {
            ViewSwitcher()
                .environmentObject(globalData)
        }
    }
}
