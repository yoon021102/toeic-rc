// 빈출 단어. day로 묶어서 하루 분량씩 공부합니다.
window.VOCAB = [
  // Day 1: 회사·인사
  { day: 1, word: "applicant", pos: "n.", meaning: "지원자", ex: "All applicants must submit a résumé." },
  { day: 1, word: "qualified", pos: "adj.", meaning: "자격을 갖춘", ex: "We are looking for qualified candidates." },
  { day: 1, word: "candidate", pos: "n.", meaning: "후보자, 지원자", ex: "Three candidates were invited for interviews." },
  { day: 1, word: "promote", pos: "v.", meaning: "승진시키다; 홍보하다", ex: "Ms. Cho was promoted to manager." },
  { day: 1, word: "colleague", pos: "n.", meaning: "동료", ex: "He discussed the issue with his colleagues." },
  { day: 1, word: "responsible", pos: "adj.", meaning: "책임이 있는 (for)", ex: "She is responsible for the budget." },
  { day: 1, word: "retire", pos: "v.", meaning: "은퇴하다", ex: "Mr. Lim will retire at the end of the year." },
  { day: 1, word: "recruit", pos: "v.", meaning: "채용하다", ex: "The firm plans to recruit ten engineers." },
  { day: 1, word: "personnel", pos: "n.", meaning: "인사과; 직원들", ex: "Contact the personnel department for details." },
  { day: 1, word: "performance", pos: "n.", meaning: "실적, 성과; 공연", ex: "Annual performance reviews start next week." },

  // Day 2: 사무·업무
  { day: 2, word: "deadline", pos: "n.", meaning: "마감 기한", ex: "The deadline for the report is Friday." },
  { day: 2, word: "submit", pos: "v.", meaning: "제출하다", ex: "Please submit the form by noon." },
  { day: 2, word: "attach", pos: "v.", meaning: "첨부하다", ex: "I have attached the revised schedule." },
  { day: 2, word: "postpone", pos: "v.", meaning: "연기하다", ex: "The meeting was postponed until Monday." },
  { day: 2, word: "approve", pos: "v.", meaning: "승인하다", ex: "The director approved the proposal." },
  { day: 2, word: "revise", pos: "v.", meaning: "수정하다", ex: "We revised the contract terms." },
  { day: 2, word: "agenda", pos: "n.", meaning: "안건, 의제", ex: "The first item on the agenda is the budget." },
  { day: 2, word: "reimburse", pos: "v.", meaning: "변제하다, 환급하다", ex: "Travel expenses will be reimbursed." },
  { day: 2, word: "supervisor", pos: "n.", meaning: "상사, 관리자", ex: "Report any problems to your supervisor." },
  { day: 2, word: "on behalf of", pos: "phr.", meaning: "~을 대신하여, ~을 대표하여", ex: "I am writing on behalf of the committee." },

  // Day 3: 마케팅·판매
  { day: 3, word: "launch", pos: "v./n.", meaning: "출시(하다)", ex: "The company will launch a new product line." },
  { day: 3, word: "competitor", pos: "n.", meaning: "경쟁사", ex: "Our prices are lower than our competitors'." },
  { day: 3, word: "survey", pos: "n.", meaning: "설문 조사", ex: "Customers were asked to complete a survey." },
  { day: 3, word: "discount", pos: "n.", meaning: "할인", ex: "Members receive a 10 percent discount." },
  { day: 3, word: "promotion", pos: "n.", meaning: "판촉; 승진", ex: "The summer promotion ends on July 31." },
  { day: 3, word: "merchandise", pos: "n.", meaning: "상품", ex: "All merchandise is on sale this week." },
  { day: 3, word: "affordable", pos: "adj.", meaning: "(가격이) 적당한", ex: "We offer affordable prices." },
  { day: 3, word: "exclusive", pos: "adj.", meaning: "독점적인, 전용의", ex: "Subscribers get exclusive offers." },
  { day: 3, word: "estimate", pos: "n./v.", meaning: "견적(서); 추정하다", ex: "Please send us a cost estimate." },
  { day: 3, word: "demand", pos: "n.", meaning: "수요; 요구", ex: "Demand for electric cars is rising." },

  // Day 4: 고객·서비스
  { day: 4, word: "inquiry", pos: "n.", meaning: "문의", ex: "Thank you for your inquiry." },
  { day: 4, word: "complaint", pos: "n.", meaning: "불만, 항의", ex: "We received several complaints about delays." },
  { day: 4, word: "refund", pos: "n./v.", meaning: "환불(하다)", ex: "You may request a full refund within 30 days." },
  { day: 4, word: "warranty", pos: "n.", meaning: "품질 보증(서)", ex: "The laptop comes with a two-year warranty." },
  { day: 4, word: "replacement", pos: "n.", meaning: "교체(품), 후임자", ex: "We will send a replacement immediately." },
  { day: 4, word: "inconvenience", pos: "n.", meaning: "불편", ex: "We apologize for any inconvenience." },
  { day: 4, word: "subscription", pos: "n.", meaning: "구독", ex: "Your subscription will be renewed automatically." },
  { day: 4, word: "valid", pos: "adj.", meaning: "유효한", ex: "This coupon is valid until December." },
  { day: 4, word: "prompt", pos: "adj.", meaning: "신속한", ex: "Thank you for your prompt reply." },
  { day: 4, word: "satisfaction", pos: "n.", meaning: "만족", ex: "Customer satisfaction is our priority." },

  // Day 5: 출장·행사·시설
  { day: 5, word: "itinerary", pos: "n.", meaning: "여행 일정표", ex: "Your travel itinerary is attached." },
  { day: 5, word: "accommodation", pos: "n.", meaning: "숙박 시설", ex: "Accommodation will be provided for speakers." },
  { day: 5, word: "venue", pos: "n.", meaning: "(행사) 장소", ex: "The venue for the conference has changed." },
  { day: 5, word: "register", pos: "v.", meaning: "등록하다 (for)", ex: "Register for the workshop online." },
  { day: 5, word: "renovation", pos: "n.", meaning: "보수, 개조", ex: "The lobby is closed for renovation." },
  { day: 5, word: "facility", pos: "n.", meaning: "시설", ex: "The new facility opens in March." },
  { day: 5, word: "relocate", pos: "v.", meaning: "이전하다", ex: "The office will relocate downtown." },
  { day: 5, word: "attendee", pos: "n.", meaning: "참석자", ex: "Each attendee will receive a name tag." },
  { day: 5, word: "reservation", pos: "n.", meaning: "예약", ex: "I'd like to confirm my reservation." },
  { day: 5, word: "in advance", pos: "phr.", meaning: "미리", ex: "Please book your seat in advance." }
];
