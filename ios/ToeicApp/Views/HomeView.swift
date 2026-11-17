import SwiftUI

struct HomeView: View {
    @Environment(ContentStore.self) private var content
    @Environment(ProgressStore.self) private var progress

    var body: some View {
        let today = content.todaysDay()
        let todayWords = content.words(for: today)
        let total = content.vocab.words.count
        let grammarTotal = content.grammar.reduce(0) { $0 + $1.quiz.count }
        let grammarCorrect = progress.grammarResults.values.filter { $0 }.count

        NavigationStack {
            List {
                Section {
                    VStack(alignment: .leading, spacing: 6) {
                        if let d = content.daysUntilExam() {
                            Text(dDayText(d)).font(.largeTitle.bold())
                        }
                        Text("시험일 \(content.vocab.examDate)")
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 4)
                }

                if !todayWords.isEmpty {
                Section("오늘의 단어") {
                    NavigationLink {
                        VocabDayView(day: today)
                    } label: {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Day \(today) · \(content.theme(for: today))").font(.headline)
                            ProgressView(value: Double(progress.knownCount(in: todayWords)),
                                         total: Double(max(todayWords.count, 1)))
                            Text("\(progress.knownCount(in: todayWords)) / \(todayWords.count) 외움")
                                .font(.caption).foregroundStyle(.secondary)
                        }
                    }
                }
                }

                Section("전체 진도") {
                    LabeledContent("외운 단어", value: "\(progress.known.count) / \(total)")
                    NavigationLink {
                        MissedWordsView()
                    } label: {
                        LabeledContent("오답 노트", value: "\(progress.missed.count)개")
                    }
                    LabeledContent("문법 퀴즈 정답",
                                   value: "\(grammarCorrect) / \(grammarTotal)")
                }
            }
            .navigationTitle("토익 RC")
        }
    }

    private func dDayText(_ d: Int) -> String {
        if d > 0 { return "시험까지 D-\(d)" }
        return d == 0 ? "오늘 시험날! 화이팅" : "시험 종료"
    }
}

struct MissedWordsView: View {
    @Environment(ContentStore.self) private var content
    @Environment(ProgressStore.self) private var progress

    var body: some View {
        let words = content.vocab.words.filter { progress.missed.contains($0.word) }
        Group {
            if words.isEmpty {
                ContentUnavailableView("틀린 단어가 없어요", systemImage: "checkmark.seal",
                                       description: Text("단어 퀴즈에서 틀린 단어가 여기에 모입니다."))
            } else {
                List {
                    Section {
                        NavigationLink("오답만 다시 퀴즈 풀기") { VocabQuizView(title: "오답 퀴즈", words: words) }
                        NavigationLink("오답만 카드로 보기") { FlashcardView(title: "오답 카드", words: words) }
                    }
                    Section {
                        ForEach(words) { WordRow(word: $0) }
                    }
                }
            }
        }
        .navigationTitle("오답 노트")
    }
}
