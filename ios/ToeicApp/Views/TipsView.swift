import SwiftUI

struct TipsView: View {
    @Environment(ContentStore.self) private var content
    @Environment(ProgressStore.self) private var progress
    @State private var confirmReset = false

    var body: some View {
        NavigationStack {
            List {
                ForEach(content.tips) { tip in
                    Section {
                        Text(tip.time).font(.footnote).foregroundStyle(.secondary)
                        ForEach(tip.tips, id: \.self) { Text($0) }
                    } header: {
                        Text("\(tip.part) · \(tip.title)")
                    }
                }
                Section {
                    Button("학습 기록 초기화", role: .destructive) { confirmReset = true }
                }
            }
            .navigationTitle("풀이 팁")
            .confirmationDialog("외운 단어, 오답 노트, 퀴즈 기록이 모두 지워집니다.",
                                isPresented: $confirmReset, titleVisibility: .visible) {
                Button("초기화", role: .destructive) { progress.reset() }
            }
        }
    }
}
