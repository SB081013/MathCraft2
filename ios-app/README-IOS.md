# Running MathCraft: ACT Quest on iPhone

You have **two ways** to run MathCraft as a full-screen iPhone app:

---

## Option 1: Instant iPhone App via Home Screen (Works Right Now — No Mac Required!)

MathCraft is a full **offline-capable iOS Progressive Web App (PWA)** with native-style touch controls (left-thumb joystick, touch-drag 360° look, dedicated Mine/Place/Jump buttons, custom home screen icon, and iPhone safe-area layout).

1. Connect your Windows PC and iPhone to the **same Wi-Fi network**.
2. Right-click **`start-iphone-wifi.ps1`** in the `mathcraft-act` folder and choose **Run with PowerShell** (or run it from an elevated PowerShell window if Windows prompts for LAN access).
3. Open **Safari** on your iPhone and type the `http://<your-PC-IP>:8765` address shown in the PowerShell window.
4. Tap the **Share** button (square with up-arrow) → tap **"Add to Home Screen"** → tap **Add**.
5. Launch **MathCraft** from your iPhone Home Screen! It opens **full-screen** (no Safari address bar) and caches all files so you can even play **offline**!

> **Tip:** You can also host this folder for free on **GitHub Pages**, **Netlify**, or **Cloudflare Pages** (just drag-and-drop the `mathcraft-act` folder) to get an HTTPS link you can install on any iPhone anywhere!

---

## Option 2: Native Xcode iOS App Store / TestFlight Build (Requires a Mac)

Inside `ios-app/` is a complete **SwiftUI + WKWebView** native iOS project with a live **iPhone Taptic Engine haptics bridge** (so mining blocks, boss hits, and right/wrong answers give real physical iPhone haptic feedback!).

### Quickest setup on a Mac:
1. Copy the `mathcraft-act` folder to your Mac.
2. Either run `xcodegen generate` inside `mathcraft-act/ios-app` (using the included `project.yml`) **OR** create a new **Xcode → iOS App (SwiftUI)** named `MathCraftIOS`, drag in:
   - `MathCraftIOS/MathCraftApp.swift`
   - `MathCraftIOS/GameWebView.swift`
   - `MathCraftIOS/Info.plist`
   - Copy `index.html`, `manifest.json`, `sw.js`, `css/`, `js/`, and `icons/` into a **folder reference** named `WebBundle` in your Xcode target.
   - Set `icons/icon-512.png` as your AppIcon in `Assets.xcassets`.
3. Plug in your iPhone, select your Apple ID under **Signing & Capabilities**, and press **▶ Run** in Xcode!
