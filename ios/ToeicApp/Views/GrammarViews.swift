import SwiftUI

struct GrammarListView: View {
    @Environment(ContentStore.self) private var content
    @Environment(ProgressStore.self) private var progress

    var body: some View {
        NavigationStack {
            List(content.grammar) { topic in
                NavigationLink {
                    GrammarDetailView(topic: topic)
                } label: {
                    HStack {
                        VStack(alignment: .leading) {
                            Text(topic.title).font(.headline)
                            Text(topic.part).font(.caption).foregroundStyle(.secondary)
                        }
                        Spacer()
                        Text("\(progress.grammarCorrectCount(topic: topic))/\(topic.quiz.count)")
                            .font(.caption.monospacedDigit()).foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle("문법")
        }
    }
}

struct GrammarDetailView: View {
    let topic: GrammarTopic

    var body: some View {
        List {
            Section { Text(md(topic.summary)) }
            Section("핵심 포인트") {
                ForEach(topic.points, id: \.self) { Text(md($0)) }
            }
            Section("예문") {
                ForEach(topic.examples, id: \.self) { ex in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(md(ex.en))
                        Text(md(ex.ko)).font(.footnote).foregroundStyle(.secondary)
                    }
                }
            }
            Section("확인 문제") {
                ForEach(topic.quiz.indices, id: \.self) { i in
                    QuestionCard(topicID: topic.id, index: i, question: topic.quiz[i])
                }
            }
        }
        .navigationTitle(topic.title)
    }
}

/// Part 5 형식의 4지선다 문제 한 개.
struct QuestionCard: View {
    let topicID: String
    let index: Int
    let question: QuizQuestion
    @Environment(ProgressStore.self) private var progress
    @State private var picked: Int?

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Q\(index + 1). \(question.question)").font(.body.weight(.medium))
            ForEach(question.choices.indices, id: \.self) { i in
                Button {
                    picked = i
                    progress.recordGrammar(topic: topicID, index: index, correct: i == question.answer)
                } label: {
                    HStack {
                        Text("(\(["A", "B", "C", "D"][min(i, 3)])) \(question.choices[i])")
                        Spacer()
                        if picked != nil && i == question.answer { Image(systemName: "checkmark").foregroundStyle(.green) }
                        if picked == i && i != question.answer { Image(systemName: "xmark").foregroundStyle(.red) }
                    }
                }
                .buttonStyle(.borderless)
                .disabled(picked != nil)
            }
            if picked != nil {
                Text(md(question.explanation)).font(.footnote).foregroundStyle(.secondary)
                Button("다시 풀기") { picked = nil }.font(.footnote).buttonStyle(.borderless)
            }
        }
        .padding(.vertical, 4)
    }
}

/// JSON에 **굵게** 표시가 들어 있어 마크다운으로 렌더링합니다.
func md(_ s: String) -> AttributedString {
    (try? AttributedString(markdown: s, options: .init(interpretedSyntax: .inlineOnlyPreservingWhitespace))) ?? AttributedString(s)
}
