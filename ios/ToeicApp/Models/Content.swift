import Foundation
import Observation

struct VocabWord: Codable, Identifiable, Hashable {
    let day: Int
    let word: String
    let pos: String
    let meaning: String
    let example: String
    var id: String { word }
}

struct VocabBook: Codable {
    let examDate: String
    let studyStart: String
    let themes: [String: String]
    let words: [VocabWord]
}

struct QuizQuestion: Codable, Hashable {
    let question: String
    let choices: [String]
    let answer: Int
    let explanation: String
}

struct GrammarExample: Codable, Hashable {
    let en: String
    let ko: String
}

struct GrammarTopic: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let part: String
    let summary: String
    let points: [String]
    let examples: [GrammarExample]
    let quiz: [QuizQuestion]
}

struct PartTip: Codable, Identifiable, Hashable {
    let part: String
    let title: String
    let time: String
    let tips: [String]
    var id: String { part }
}

/// 앱 번들의 JSON(Resources/)을 읽어 들이는 읽기 전용 콘텐츠 저장소.
@Observable
final class ContentStore {
    let vocab: VocabBook
    let grammar: [GrammarTopic]
    let tips: [PartTip]

    init(bundle: Bundle = .main) {
        vocab = Self.load("vocab", bundle: bundle)
        grammar = Self.load("grammar", bundle: bundle)
        tips = Self.load("tips", bundle: bundle)
    }

    var days: [Int] { Array(Set(vocab.words.map(\.day))).sorted() }

    func words(for day: Int) -> [VocabWord] { vocab.words.filter { $0.day == day } }

    func theme(for day: Int) -> String { vocab.themes[String(day)] ?? "" }

    var examDate: Date? { Self.dateFormatter.date(from: vocab.examDate) }
    var studyStart: Date? { Self.dateFormatter.date(from: vocab.studyStart) }

    /// 시험까지 남은 날 수 (오늘 = 0일 기준).
    func daysUntilExam(from now: Date = .now) -> Int? {
        guard let exam = examDate else { return nil }
        let cal = Calendar.current
        return cal.dateComponents([.day], from: cal.startOfDay(for: now), to: cal.startOfDay(for: exam)).day
    }

    /// 학습 시작일부터 하루 1 Day 진도로 오늘 공부할 Day.
    func todaysDay(from now: Date = .now) -> Int {
        guard let start = studyStart else { return 1 }
        let cal = Calendar.current
        let elapsed = cal.dateComponents([.day], from: cal.startOfDay(for: start), to: cal.startOfDay(for: now)).day ?? 0
        return min(max(elapsed + 1, 1), days.last ?? 1)
    }

    private static let dateFormatter: DateFormatter = {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .gregorian)
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "yyyy-MM-dd"
        return f
    }()

    private static func load<T: Decodable>(_ name: String, bundle: Bundle) -> T {
        guard let url = bundle.url(forResource: name, withExtension: "json"),
              let data = try? Data(contentsOf: url) else {
            fatalError("\(name).json 이 앱 번들에 없습니다.")
        }
        do { return try JSONDecoder().decode(T.self, from: data) }
        catch { fatalError("\(name).json 을 읽지 못했습니다: \(error)") }
    }
}
