//
//  GlobalData.swift
//  CoralBase
//
//  Created by Shohruh Ismatulla on 2/18/25.
//

import SwiftUI
import Combine

class GlobalData: ObservableObject {
    @Published var userId: UUID?
    @Published var fullName: String?
    @Published var userName: String?
    @Published var email: String?
    @Published var password: String?
    @Published var isLoggedIn: Bool = false
    @Published var count: Int = 1
}
