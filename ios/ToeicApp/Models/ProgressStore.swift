import Foundation
import Observation

/// 학습 기록. 기기 안 UserDefaults에 저장됩니다.
@Observable
final class ProgressStore {
    /// 외운 단어
    private(set) var known: Set<String>
    /// 틀린 단어 (오답 노트)
    private(set) var missed: Set<String>
    /// 문법 퀴즈: "주제id#번호" → 맞혔는지
    private(set) var grammarResults: [String: Bool]

    private let defaults: UserDefaults

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        known = Set(defaults.stringArray(forKey: Keys.known) ?? [])
        missed = Set(defaults.stringArray(forKey: Keys.missed) ?? [])
        grammarResults = (defaults.dictionary(forKey: Keys.grammar) as? [String: Bool]) ?? [:]
    }

    func isKnown(_ word: VocabWord) -> Bool { known.contains(word.word) }

    func setKnown(_ word: VocabWord, _ value: Bool) {
        if value { known.insert(word.word); missed.remove(word.word) }
        else { known.remove(word.word) }
        save()
    }

    func recordQuiz(_ word: VocabWord, correct: Bool) {
        if correct { missed.remove(word.word) } else { missed.insert(word.word); known.remove(word.word) }
        save()
    }

    func knownCount(in words: [VocabWord]) -> Int { words.filter { known.contains($0.word) }.count }

    func recordGrammar(topic: String, index: Int, correct: Bool) {
        grammarResults["\(topic)#\(index)"] = correct
        save()
    }

    func grammarCorrectCount(topic: GrammarTopic) -> Int {
        topic.quiz.indices.filter { grammarResults["\(topic.id)#\($0)"] == true }.count
    }

    func reset() {
        known = []; missed = []; grammarResults = [:]
        save()
    }

    private func save() {
        defaults.set(Array(known), forKey: Keys.known)
        defaults.set(Array(missed), forKey: Keys.missed)
        defaults.set(grammarResults, forKey: Keys.grammar)
    }

    private enum Keys {
        static let known = "progress.known"
        static let missed = "progress.missed"
        static let grammar = "progress.grammar"
    }
}
