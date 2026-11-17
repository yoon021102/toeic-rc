import SwiftUI

@main
struct ToeicApp: App {
    @State private var content = ContentStore()
    @State private var progress = ProgressStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(content)
                .environment(progress)
        }
    }
}

struct RootView: View {
    var body: some View {
        TabView {
            HomeView()
                .tabItem { Label("홈", systemImage: "house") }
            VocabDayListView()
                .tabItem { Label("단어", systemImage: "character.book.closed") }
            GrammarListView()
                .tabItem { Label("문법", systemImage: "text.badge.checkmark") }
            TipsView()
                .tabItem { Label("팁", systemImage: "lightbulb") }
        }
    }
}
