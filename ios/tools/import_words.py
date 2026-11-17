#!/usr/bin/env python3
"""단어 목록 텍스트 파일들을 ToeicApp/Resources/vocab.json 으로 변환합니다.

형식 (한 줄에 단어 하나, 영어 뒤에 한글 뜻):
    [LC/Part1]
    carry 나르다, 휴대하다
    in charge of ~을 책임지는

[대괄호] 머리글마다 단어장 세트 하나가 됩니다 (앱의 Day 1, 2, 3 ...).
사용법:  python3 tools/import_words.py tools/words-*.txt
"""
import json, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "ToeicApp" / "Resources" / "vocab.json"
# 뜻은 첫 한글 글자 또는 '~' 에서 시작합니다.
SPLIT = re.compile(r"^(.*?[A-Za-z.)'\-])\s+([~가-힣].*)$")

def main(paths):
    data = json.loads(OUT.read_text(encoding="utf-8"))
    themes, words, seen = {}, [], set()
    day, header = 0, None
    for path in paths:
        for n, line in enumerate(pathlib.Path(path).read_text(encoding="utf-8").splitlines(), 1):
            line = line.strip()
            if not line:
                continue
            if line.startswith("[") and line.endswith("]"):
                day += 1
                header = line[1:-1].strip()
                themes[str(day)] = header
                continue
            m = SPLIT.match(line)
            if not m or day == 0:
                sys.exit(f"{path}:{n}: 읽을 수 없는 줄입니다: {line}")
            word = m.group(1).strip()
            meaning = re.sub(r"\s+,", ",", m.group(2).strip())
            if word.lower() in seen:
                print(f"중복 건너뜀: {word}", file=sys.stderr)
                continue
            seen.add(word.lower())
            words.append({"day": day, "word": word, "meaning": meaning})
    data["themes"], data["words"] = themes, words
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{len(words)}개 단어, {len(themes)}개 세트 → {OUT.relative_to(ROOT)}")

if __name__ == "__main__":
    main(sys.argv[1:] or sorted(str(p) for p in (ROOT / "tools").glob("words-*.txt")))
