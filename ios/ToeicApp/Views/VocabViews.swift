import SwiftUI

struct VocabDayListView: View {
    @Environment(ContentStore.self) private var content
    @Environment(ProgressStore.self) private var progress

    var body: some View {
        NavigationStack {
            List(content.days, id: \.self) { day in
                let words = content.words(for: day)
                NavigationLink {
                    VocabDayView(day: day)
                } label: {
                    HStack {
                        VStack(alignment: .leading) {
                            Text(content.theme(for: day)).font(.headline)
                        }
                        Spacer()
                        Text("\(progress.knownCount(in: words))/\(words.count)")
                            .font(.caption.monospacedDigit()).foregroundStyle(.secondary)
                    }
                }
            }
            .overlay {
                if content.days.isEmpty {
                    ContentUnavailableView("단어가 아직 없어요", systemImage: "character.book.closed",
                                           description: Text("Resources/vocab.json 에 단어를 넣으면 여기에 Day별로 나옵니다."))
                }
            }
            .navigationTitle("단어장")
        }
    }
}

struct VocabDayView: View {
    let day: Int
    @Environment(ContentStore.self) private var content
    @State private var hideKnown = false

    var body: some View {
        let all = content.words(for: day)
        List {
            Section {
                NavigationLink { FlashcardView(title: "\(content.theme(for: day)) 카드", words: all) } label: {
                    Label("플래시카드", systemImage: "rectangle.on.rectangle.angled")
                }
                NavigationLink { VocabQuizView(title: "\(content.theme(for: day)) 퀴즈", words: all) } label: {
                    Label("뜻 고르기 퀴즈", systemImage: "checklist")
                }
            }
            Section("\(all.count)단어") {
                ForEach(all) { WordRow(word: $0) }
            }
        }
        .navigationTitle(content.theme(for: day))
    }
}

struct WordRow: View {
    let word: VocabWord
    @Environment(ProgressStore.self) private var progress

    var body: some View {
        let known = progress.isKnown(word)
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 3) {
                HStack(alignment: .firstTextBaseline) {
                    Text(word.word).font(.headline)
                    if let pos = word.pos { Text(pos).font(.caption).foregroundStyle(.secondary) }
                }
                Text(word.meaning)
                if let ex = word.example { Text(ex).font(.footnote).foregroundStyle(.secondary) }
            }
            Spacer()
            Button {
                progress.setKnown(word, !known)
            } label: {
                Image(systemName: known ? "checkmark.circle.fill" : "circle")
                    .font(.title2)
                    .foregroundStyle(known ? Color.green : Color.secondary)
            }
            .buttonStyle(.plain)
            .accessibilityLabel(known ? "외움 취소" : "외움 표시")
        }
    }
}

struct FlashcardView: View {
    let title: String
    let words: [VocabWord]
    @Environment(ProgressStore.self) private var progress
    @State private var deck: [VocabWord] = []
    @State private var index = 0
    @State private var flipped = false

    var body: some View {
        VStack(spacing: 20) {
            if deck.isEmpty {
                ContentUnavailableView("모두 외웠어요", systemImage: "party.popper",
                                       description: Text("‘외운 단어 포함’으로 다시 볼 수 있어요."))
                Button("외운 단어 포함해서 다시") { start(includeKnown: true) }
                    .buttonStyle(.borderedProminent)
            } else if index >= deck.count {
                ContentUnavailableView("한 바퀴 끝!", systemImage: "checkmark.circle",
                                       description: Text("남은 단어 \(deck.filter { !progress.isKnown($0) }.count)개"))
                Button("모르는 단어만 다시") { start(includeKnown: false) }
                    .buttonStyle(.borderedProminent)
            } else {
                let word = deck[index]
                Text("\(index + 1) / \(deck.count)").font(.caption.monospacedDigit()).foregroundStyle(.secondary)
                card(word)
                    .onTapGesture { withAnimation(.snappy) { flipped.toggle() } }
                HStack(spacing: 16) {
                    Button { next(knew: false) } label: {
                        Label("모름", systemImage: "xmark").frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered).tint(.red)
                    Button { next(knew: true) } label: {
                        Label("알아요", systemImage: "checkmark").frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent).tint(.green)
                }
                .controlSize(.large)
            }
        }
        .padding()
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { if deck.isEmpty && index == 0 { start(includeKnown: false) } }
    }

    private func card(_ word: VocabWord) -> some View {
        VStack(spacing: 12) {
            Text(word.word).font(.system(size: 36, weight: .bold))
            if flipped {
                if let pos = word.pos { Text(pos).foregroundStyle(.secondary) }
                Text(word.meaning).font(.title2).multilineTextAlignment(.center)
                if let ex = word.example {
                    Text(ex).font(.callout).foregroundStyle(.secondary).multilineTextAlignment(.center)
                }
            } else {
                Text("탭해서 뜻 보기").font(.footnote).foregroundStyle(.tertiary)
            }
        }
        .padding(24)
        .frame(maxWidth: .infinity, minHeight: 280)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 20))
    }

    private func start(includeKnown: Bool) {
        deck = (includeKnown ? words : words.filter { !progress.isKnown($0) }).shuffled()
        index = 0
        flipped = false
    }

    private func next(knew: Bool) {
        progress.setKnown(deck[index], knew)
        flipped = false
        index += 1
    }
}

struct VocabQuizView: View {
    let title: String
    let words: [VocabWord]
    var questionCount = 10

    @Environment(ContentStore.self) private var content
    @Environment(ProgressStore.self) private var progress
    @State private var questions: [QuizItem] = []
    @State private var index = 0
    @State private var picked: String?
    @State private var score = 0

    var body: some View {
        VStack(spacing: 16) {
            if questions.isEmpty {
                ProgressView()
            } else if index >= questions.count {
                ContentUnavailableView("\(questions.count)문제 중 \(score)개 정답", systemImage: "flag.checkered",
                                       description: Text("틀린 단어는 홈의 ‘오답 노트’에 모였어요."))
                Button("다시 풀기") { makeQuiz() }.buttonStyle(.borderedProminent)
            } else {
                let q = questions[index]
                Text("\(index + 1) / \(questions.count)").font(.caption.monospacedDigit()).foregroundStyle(.secondary)
                Text(q.word.word).font(.system(size: 34, weight: .bold))
                if let pos = q.word.pos { Text(pos).foregroundStyle(.secondary) }
                ForEach(q.choices, id: \.self) { choice in
                    Button { choose(choice) } label: {
                        Text(choice).frame(maxWidth: .infinity, alignment: .leading).padding(.vertical, 6)
                    }
                    .buttonStyle(.bordered)
                    .tint(tint(for: choice, answer: q.word.meaning))
                    .disabled(picked != nil)
                }
                if picked != nil {
                    if let ex = q.word.example { Text(ex).font(.footnote).foregroundStyle(.secondary) }
                    Button("다음") { index += 1; picked = nil }.buttonStyle(.borderedProminent)
                }
                Spacer()
            }
        }
        .padding()
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { if questions.isEmpty { makeQuiz() } }
    }

    private func tint(for choice: String, answer: String) -> Color? {
        guard let picked else { return nil }
        if choice == answer { return .green }
        if choice == picked { return .red }
        return .gray
    }

    private func choose(_ choice: String) {
        let word = questions[index].word
        picked = choice
        let correct = choice == word.meaning
        if correct { score += 1 }
        progress.recordQuiz(word, correct: correct)
    }

    private func makeQuiz() {
        let pool = content.vocab.words
        questions = words.shuffled().prefix(questionCount).map { word -> QuizItem in
            // 오답 보기는 같은 품사 단어에서 우선 고릅니다.
            let samePos = pool.filter { $0.pos == word.pos && $0.meaning != word.meaning }
            let source = samePos.count >= 3 ? samePos : pool.filter { $0.meaning != word.meaning }
            var choices = Set<String>([word.meaning])
            while choices.count < 4, let w = source.randomElement() { choices.insert(w.meaning) }
            return QuizItem(word: word, choices: Array(choices).shuffled())
        }
        index = 0; picked = nil; score = 0
    }
}

struct QuizItem {
    let word: VocabWord
    let choices: [String]
}
