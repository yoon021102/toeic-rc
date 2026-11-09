// 문법 콘텐츠. 항목을 추가하려면 같은 형식의 객체를 배열에 넣으면 됩니다.
window.GRAMMAR = [
  {
    id: "parts-of-speech",
    title: "품사 자리 찾기",
    part: "Part 5·6",
    summary: "빈칸 앞뒤만 보고 명사·형용사·부사·동사 자리를 구분합니다. Part 5에서 가장 많이 나옵니다.",
    points: [
      "관사(a/the)·소유격(his, our) + ___ + 전치사 → 명사 자리",
      "관사 + ___ + 명사 → 형용사 자리",
      "be동사 + ___ + p.p. / have + ___ + p.p. → 부사 자리",
      "완전한 문장 앞뒤, 동사 앞 → 부사 자리",
      "주어 + ___ + 목적어, 문장에 동사가 없으면 → 동사 자리"
    ],
    examples: [
      { en: "The <b>success</b> of the campaign surprised everyone.", ko: "관사 the 뒤, 전치사 of 앞이므로 명사." },
      { en: "Please submit a <b>detailed</b> report by Friday.", ko: "관사 a와 명사 report 사이이므로 형용사." },
      { en: "The order was <b>carefully</b> packed.", ko: "be동사와 p.p. 사이이므로 부사." }
    ],
    quiz: [
      { q: "The ___ of the new branch will be announced next week.", choices: ["locate", "location", "located", "locally"], answer: 1, why: "관사 The 뒤, 전치사 of 앞은 명사 자리입니다." },
      { q: "Ms. Kim has ___ reviewed the contract.", choices: ["thorough", "thoroughness", "thoroughly", "more thorough"], answer: 2, why: "have와 p.p. 사이는 부사 자리입니다." }
    ]
  },
  {
    id: "verb-tense",
    title: "시제",
    part: "Part 5·6",
    summary: "시간 부사(구)가 정답의 단서입니다. 문장 속 시간 표현부터 찾으세요.",
    points: [
      "yesterday, last ~, ~ ago → 과거",
      "since + 과거시점, for + 기간, recently, so far → 현재완료",
      "tomorrow, next ~, soon → 미래 (will)",
      "시간·조건 부사절(when, if, before, after, as soon as)은 미래 대신 현재시제",
      "by the time + 과거 → 과거완료 / by + 미래시점 → 미래완료"
    ],
    examples: [
      { en: "Sales <b>have increased</b> since last quarter.", ko: "since + 과거시점 → 현재완료." },
      { en: "Please call me as soon as the package <b>arrives</b>.", ko: "시간 부사절 안이므로 미래 의미라도 현재시제." }
    ],
    quiz: [
      { q: "The company ___ its headquarters to Seoul two years ago.", choices: ["moves", "has moved", "moved", "will move"], answer: 2, why: "two years ago는 과거시점을 나타내므로 과거시제입니다." },
      { q: "If the shipment ___ late, we will contact you.", choices: ["arrives", "will arrive", "arrived", "arriving"], answer: 0, why: "조건 부사절(if)에서는 미래 대신 현재시제를 씁니다." }
    ]
  },
  {
    id: "voice",
    title: "능동태와 수동태",
    part: "Part 5·6",
    summary: "빈칸 뒤에 목적어가 있으면 능동, 없으면 수동일 가능성이 큽니다.",
    points: [
      "타동사 + 목적어 있음 → 능동태",
      "목적어 없음 + by ~ → 수동태 (be + p.p.)",
      "4형식·5형식 동사는 수동태 뒤에도 명사·형용사가 올 수 있음 (be given a bonus, be considered important)",
      "자동사(arrive, occur, happen, rise)는 수동태 불가"
    ],
    examples: [
      { en: "The meeting <b>was postponed</b> until Monday.", ko: "목적어 없이 전치사구가 이어지므로 수동태." },
      { en: "Our team <b>completed</b> the project early.", ko: "목적어 the project가 있으므로 능동태." }
    ],
    quiz: [
      { q: "All applications must ___ by May 1.", choices: ["submit", "be submitted", "submitting", "have submitted"], answer: 1, why: "빈칸 뒤에 목적어가 없고 지원서는 '제출되는' 대상이므로 수동태입니다." },
      { q: "The price of fuel ___ sharply last month.", choices: ["was risen", "rose", "was raised by", "raising"], answer: 1, why: "rise는 자동사라 수동태가 안 됩니다. last month이므로 과거 rose." }
    ]
  },
  {
    id: "subject-verb",
    title: "주어와 동사의 수 일치",
    part: "Part 5·6",
    summary: "주어와 동사 사이의 수식어(전치사구, 관계사절)를 지우고 진짜 주어를 찾으세요.",
    points: [
      "The number of + 복수명사 → 단수 동사 / A number of + 복수명사 → 복수 동사",
      "each, every, -one, -body, -thing → 단수 동사",
      "주어 + 전치사구 + 동사: 전치사구 속 명사에 속지 말 것",
      "동명사·to부정사·명사절 주어 → 단수 동사"
    ],
    examples: [
      { en: "The list of participants <b>is</b> on the desk.", ko: "진짜 주어는 The list(단수)." },
      { en: "A number of employees <b>are</b> working remotely.", ko: "A number of는 '많은'의 뜻, 복수 동사." }
    ],
    quiz: [
      { q: "Each of the managers ___ responsible for a budget.", choices: ["are", "is", "be", "being"], answer: 1, why: "Each of + 복수명사는 단수 취급합니다." }
    ]
  },
  {
    id: "relative",
    title: "관계대명사",
    part: "Part 5·6",
    summary: "선행사(사람/사물)와 빈칸 뒤 문장의 구조(완전/불완전)로 고릅니다.",
    points: [
      "who(주격, 사람) / which(사물) / that(둘 다, 콤마·전치사 뒤 불가)",
      "whose + 명사 + 완전한 문장 → 소유격",
      "what = the thing which, 선행사 없음",
      "관계대명사 뒤는 불완전한 문장, 관계부사(where, when) 뒤는 완전한 문장"
    ],
    examples: [
      { en: "Applicants <b>who</b> have experience are preferred.", ko: "선행사가 사람, 뒤에 주어가 없으므로 who." },
      { en: "We met a client <b>whose</b> company is based in Busan.", ko: "뒤에 명사 + 완전한 문장이므로 whose." }
    ],
    quiz: [
      { q: "The hotel ___ we stayed at offers free breakfast.", choices: ["who", "where", "which", "whose"], answer: 2, why: "stayed at 뒤 목적어가 빠진 불완전한 문장이고 선행사가 사물이므로 which입니다. (전치사 at이 남아 있어서 where는 불가)" }
    ]
  },
  {
    id: "conjunction-preposition",
    title: "접속사와 전치사 구분",
    part: "Part 5·6",
    summary: "뜻이 같아도 뒤에 '주어+동사'가 오면 접속사, '명사(구)'가 오면 전치사입니다.",
    points: [
      "~때문에: because(접) / because of, due to(전)",
      "~에도 불구하고: although, even though(접) / despite, in spite of(전)",
      "~동안: while(접) / during(전)",
      "~하자마자: as soon as(접) / upon + -ing(전)"
    ],
    examples: [
      { en: "<b>Despite</b> the rain, the event was held.", ko: "뒤에 명사 the rain → 전치사." },
      { en: "<b>Although</b> it rained, the event was held.", ko: "뒤에 주어+동사 → 접속사." }
    ],
    quiz: [
      { q: "___ the heavy traffic, Mr. Lee arrived on time.", choices: ["Although", "Despite", "Because", "Even if"], answer: 1, why: "뒤가 명사구이고 의미가 '~에도 불구하고'이므로 전치사 Despite입니다." }
    ]
  },
  {
    id: "pronoun",
    title: "대명사의 격",
    part: "Part 5",
    summary: "빈칸의 역할(주어/목적어/소유)로 격을 고릅니다. 재귀대명사 문제도 자주 나와요.",
    points: [
      "동사 앞 → 주격 (he, they)",
      "동사·전치사 뒤 → 목적격 (him, them)",
      "명사 앞 → 소유격 (his, their)",
      "주어와 목적어가 같은 대상, 또는 강조 → 재귀대명사 (himself)",
      "by oneself = 혼자서, on one's own = 스스로"
    ],
    examples: [
      { en: "Ms. Park prepared the slides <b>herself</b>.", ko: "완전한 문장 뒤 강조 → 재귀대명사." }
    ],
    quiz: [
      { q: "Mr. Han asked that ___ assistant book the flight.", choices: ["he", "him", "his", "himself"], answer: 2, why: "명사 assistant 앞이므로 소유격 his입니다." }
    ]
  },
  {
    id: "participle",
    title: "분사 (-ing / p.p.)",
    part: "Part 5·6",
    summary: "꾸밈을 받는 명사가 동작을 '하면' -ing, '당하면' p.p.입니다.",
    points: [
      "감정동사: 사물이 감정을 일으키면 -ing (an exciting offer), 사람이 느끼면 p.p. (excited staff)",
      "자주 나오는 p.p. 형용사: attached file, enclosed document, qualified candidate, limited time",
      "자주 나오는 -ing 형용사: existing customers, leading company, remaining seats"
    ],
    examples: [
      { en: "Please review the <b>attached</b> file.", ko: "파일은 '첨부되는' 대상 → p.p." },
      { en: "We offer discounts to <b>existing</b> customers.", ko: "고정 표현 existing customers(기존 고객)." }
    ],
    quiz: [
      { q: "Only ___ candidates will be contacted for an interview.", choices: ["qualify", "qualifying", "qualified", "qualification"], answer: 2, why: "qualified candidate(자격을 갖춘 지원자)는 대표적인 p.p. 형용사 표현입니다." }
    ]
  }
];
