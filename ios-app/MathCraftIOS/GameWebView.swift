import SwiftUI
import WebKit
import UIKit

/// Full-screen native iOS WKWebView hosting the bundled MathCraft WebGL engine
/// with a native Taptic Engine haptics bridge (`window.webkit.messageHandlers.haptics`).
struct GameWebView: UIViewRepresentable {
    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        config.preferences.javaScriptCanOpenWindowsAutomatically = false

        // Register native iPhone Taptic Engine bridge
        config.userContentController.add(context.coordinator, name: "haptics")

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 0.05, green: 0.07, blue: 0.09, alpha: 1.0)
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.allowsBackForwardNavigationGestures = false

        // Load bundled web app from the app's WebBundle folder
        if let indexURL = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "WebBundle") {
            let bundleDir = indexURL.deletingLastPathComponent()
            webView.loadFileURL(indexURL, allowingReadAccessTo: bundleDir)
        }

        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKScriptMessageHandler {
        private let lightGen = UIImpactFeedbackGenerator(style: .light)
        private let medGen = UIImpactFeedbackGenerator(style: .medium)
        private let heavyGen = UIImpactFeedbackGenerator(style: .heavy)
        private let notifGen = UINotificationFeedbackGenerator()

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.name == "haptics", let style = message.body as? String else { return }
            DispatchQueue.main.async {
                switch style {
                case "heavy":
                    self.heavyGen.impactOccurred()
                case "medium":
                    self.medGen.impactOccurred()
                case "success":
                    self.notifGen.notificationOccurred(.success)
                case "error":
                    self.notifGen.notificationOccurred(.error)
                default:
                    self.lightGen.impactOccurred()
                }
            }
        }
    }
}
