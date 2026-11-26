import SwiftUI

@main
struct MathCraftApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .ignoresSafeArea()
                .statusBarHidden(true)
                .preferredColorScheme(.dark)
        }
    }
}

struct ContentView: View {
    var body: some View {
        GameWebView()
            .background(Color(red: 0.05, green: 0.07, blue: 0.09))
            .ignoresSafeArea()
    }
}
