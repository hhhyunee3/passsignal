// 합격시그널 — 대치동 입시컨설팅 · Cloudflare Worker
// 메인페이지(/) + 프로그램 상세페이지(/program/{slug}) 동적 생성, 상담 신청(/api/inquiry) 처리.
// 배포:  npx wrangler deploy
//
// 상담 알림(이메일)·구글시트 기록은 환경변수가 있을 때만 동작합니다(없으면 자동 건너뜀).
//   NOTIFY(send_email 바인딩) + NOTIFY_TO : 새 신청마다 알림 메일 발송
//   SHEET_WEBHOOK_URL : 구글 Apps Script 웹앱으로 한 줄씩 기록
//   BRAND_NAME / SITE_URL / CONTACT_TEL / CONTACT_KAKAO / CONTACT_ADDR : 화면 표기값 덮어쓰기

const SITE = {
  brand: "합격시그널",
  brandEn: "HAPGYEOK SIGNAL",
  tagline: "대치동 입시컨설팅",
  url: "https://passsignal.com",
  tel: "02-000-0000",
  kakao: "합격시그널",
  email: "contact@passsignal.com",
  addr: "서울 강남구 대치동",
};

// ─────────────────────────────────────────────────────────────
// 프로그램 데이터 (첨부 자료 기준)
// ─────────────────────────────────────────────────────────────
const PROGRAMS = {
  premium: {
    slug: "premium",
    category: "종합 진단",
    name: "프리미엄 입시솔루션 컨설팅",
    price: "600,000원",
    unit: "1회 120분",
    format: "대치 센터 방문 또는 온라인 상담 선택 가능",
    short: "원데이 프리미엄 진단으로 입시의 큰 그림을 설계합니다.",
    intro:
      "빠르게 변화하는 교육 환경 속에서 자녀의 잠재력을 최대한 발휘할 수 있도록 돕는 원데이 프리미엄 진단 컨설팅입니다. 입시 경력 10년 이상의 선별된 전문가 그룹이 학생 개개인의 강점과 약점을 정확하게 분석하여, 탁월한 1:1 맞춤형 입시 솔루션을 제시합니다.",
    target: ["고입 및 대입을 철저하게 준비하고자 하는 모든 학생과 학부모님"],
    tip:
      "본 프로그램은 입시 ‘전략’에 초점이 맞춰져 있습니다. 아직 뚜렷한 진로 설정을 하지 못한 학생은 세부 전공과 방향성을 찾는 〈진로설정 로드맵 컨설팅〉을 먼저 받으시는 것을 권장합니다.",
    curIntro:
      "120분 동안 심층적으로 진행하여, 현재 상황 분석부터 구체적인 학습 방향 설정까지 입시의 큰 그림을 완성합니다.",
    curriculum: [
      {
        title: "학생 정밀 분석 및 기초 진단",
        points: [
          "사전 신청서와 제출된 학교생활기록부를 바탕으로 학생의 현재 학업 상태를 면밀하게 파악",
          "희망 진로, 목표 대학 및 전공뿐 아니라 학생의 성격 유형과 적성까지 종합적으로 판단",
        ],
      },
      {
        title: "대입 유불리 판별 및 목표 도출",
        points: [
          "교과(내신) 및 생기부 비교과 내용을 꼼꼼히 분석하여 목표 대학·전공의 실제 지원 가능성을 판단",
          "수시와 정시 지원의 유불리를 비교 분석하고, 학생에게 가장 유리한 맞춤형 대입 목표와 전략(수시 vs 정시)을 도출",
        ],
      },
      {
        title: "전형별 맞춤형 입시 전략 수립",
        points: [
          "현재의 내신·모의고사 성적 데이터를 기반으로 실현 가능한 최적의 입시 전략 수립",
          "수시 지원 시 전형별(학종/교과/논술 등) 합격 가능성을 파악하고, 학생부 교과/비교과 기록 방향성을 명확히 설정",
        ],
      },
      {
        title: "실전 학습 솔루션 제공",
        points: [
          "도출된 입시 전략에 맞춰 현재 학생의 교과별 학습 방법과 학습량을 객관적으로 점검",
          "부족한 점을 보완하고 목표를 달성할 수 있도록 과목별 맞춤 학습 방법과 적정 학습량을 구체적으로 추천",
        ],
      },
    ],
  },

  susi: {
    slug: "susi",
    category: "대입 전략",
    name: "합격 수시 전략 컨설팅",
    price: "600,000원",
    unit: "1회 120분",
    format: "대치 센터 방문 또는 온라인 상담 선택 가능",
    short: "내신·생기부를 입체 분석해 최적의 수시 6장을 설계합니다.",
    intro:
      "합격시그널만의 데이터 분석 시스템과 전문 컨설턴트의 노하우를 결합한 수시 특화 프로그램입니다. 학생의 내신 성적과 생기부 경쟁력을 입체적으로 분석하여, 학부모님과 학생에게 가장 적합한 6개 대학을 선정하고 성공적인 합격 전략을 수립합니다.",
    targetLead: "대상 : 고3, N수 학생 및 학부모님",
    target: [
      "수시 원서 접수를 앞두고 상향·적정·안정 지원의 황금 비율을 찾고 싶은 수험생",
      "학생부종합·교과·논술 등 수많은 전형 중 자신에게 가장 유리한 조합을 찾고 싶은 학생",
    ],
    curIntro:
      "120분 동안 학생의 모든 데이터를 낱낱이 해체하고 조합하여 최적의 수시 6장 카드를 완성합니다.",
    curriculum: [
      {
        title: "목표 점검 및 내신/서류 정밀 분석",
        points: [
          "상담 전, 학부모님과 학생의 희망 대학 및 입시 목표를 명확하게 점검",
          "내신 성적을 객관적으로 분석하고, 과목별 탐구 활동과 비교과 활동을 다각도(학업·진로·공동체역량, 인재상)에서 심층 분석하여 학종 경쟁력 도출",
        ],
      },
      {
        title: "맞춤형 전형 탐색 및 유불리 진단",
        points: [
          "희망 전공·학부에 맞춰 학생에게 가장 유리한 수시 전형을 다각도로 점검",
          "계열별 논술 준비 정도를 파악하고, 기타 특별전형(농어촌·기회균형 등) 해당 여부를 꼼꼼히 체크하여 지원의 폭을 확장",
        ],
      },
      {
        title: "최적의 수시 6장 지원 포트폴리오 완성",
        points: [
          "앞선 분석을 바탕으로 최종 6개 대학 수시 지원 전략을 구체적으로 점검하고 확정",
          "합격 확률을 극대화하도록 ‘적정 지원’과 ‘상향 지원’의 배분 전략을 정교하게 마무리",
          "남은 시간 동안 충분한 Q&A로 수시 지원에 대한 모든 불안과 궁금증을 해소",
        ],
      },
    ],
  },

  jeongsi: {
    slug: "jeongsi",
    category: "대입 전략",
    name: "합격 정시 전략 컨설팅",
    price: "600,000원",
    unit: "1회 120분",
    format: "대치 센터 방문 또는 온라인 상담 선택 가능",
    short: "1점도 낭비 없이, 가·나·다군 최적 조합을 완성합니다.",
    intro:
      "합격시그널의 데이터 분석 시스템과 전문 컨설턴트의 노하우를 바탕으로, 수능 직후 학부모님과 학생에게 가장 적합한 가/나/다군 3개 대학을 선정하여 합격 전략을 수립하는 정시 특화 컨설팅입니다. 1점의 점수도 낭비하지 않는 치밀한 전략으로 합격의 문을 엽니다.",
    targetLead: "대상 : 고3, N수 학생 및 학부모님",
    target: [
      "수능 성적표를 바탕으로 합격 확률을 극대화하고 싶은 학생",
      "복잡한 정시 지원 룰과 대학별 변수 때문에 지원 전략 수립이 막막한 학생",
    ],
    curIntro:
      "120분 동안 다년간 축적된 입시 데이터와 학생의 성적을 매칭하여 최적의 정시 3장 카드를 완성합니다.",
    curriculum: [
      {
        title: "제출 서류 및 수능 성적 정밀 분석",
        points: [
          "학생의 성적 자료를 기반으로 영역별/반영비율별 유불리를 정확하게 진단",
          "표준점수·백분위 등을 종합적으로 고려하여 전국 단위 위치를 파악하고 강약점을 분석",
        ],
      },
      {
        title: "대학별 환산 점수 및 합격 가능성 예측",
        points: [
          "다년간 축적된 합격시그널의 입시 데이터와 노하우를 활용해 가장 적합한 지원 전략의 큰 틀을 수립",
          "실제 합불 사례를 정밀 분석하여 목표 대학·학과의 합격 가능성을 객관적으로 예측",
        ],
      },
      {
        title: "진로/적성 기반 최적의 3군(가/나/다) 조합 완성",
        points: [
          "모의 지원 데이터와 추가 합격 변수까지 모두 고려하여 최종 정시 맞춤 전략을 제시하고 파이널 지원을 지원",
        ],
      },
    ],
  },

  gumjeong: {
    slug: "gumjeong",
    category: "대입 전략",
    name: "검정고시 전략 컨설팅",
    price: "600,000원",
    unit: "1회 120분",
    format: "대치 센터 방문 또는 온라인 상담 선택 가능",
    short: "검정고시 환산 분석부터 대체 서류까지 완벽 가이드합니다.",
    intro:
      "학교 밖 청소년과 검정고시 출신 학생들만을 위한 1:1 맞춤형 대입 전략 컨설팅입니다. 복잡한 대학별 검정고시 성적 환산 방식을 정밀하게 분석하고, 학교생활기록부를 대체할 ‘청소년 활동 증빙 서류’ 준비까지 완벽하게 가이드합니다. 검정고시생이 겪는 정보의 비대칭을 해소하고 합격의 문을 획기적으로 넓혀드립니다.",
    targetLead: "대상 : 대입을 준비하는 검정고시 합격(예정)자 및 학교 밖 청소년",
    target: [
      "나의 검정고시 원점수로 지원 가능한 대학·전형(교과/종합/논술 등)을 명확히 파악하고 싶은 학생",
      "검정고시 출신자에게 유리하거나 지원 제한이 없는 숨은 전형을 찾고 싶은 학생",
      "학생부를 대체할 ‘대체 서식(청소년 활동 증빙 서류 등)’을 어떻게 기획·작성할지 막막한 학생",
    ],
    curIntro:
      "120분 동안 검정고시생 특유의 전형 룰을 분석하여, 일반고 학생들과 당당히 경쟁할 수 있는 무기를 만듭니다.",
    curriculum: [
      {
        title: "검정고시 성적 정밀 진단 및 환산점수 분석",
        points: [
          "취득(또는 예상) 과목별 원점수를 바탕으로 각 대학의 내신 산출 방식(환산점수/비교내신)을 대입하여 정확한 현재 위치를 파악",
          "과목별 만점 여부와 감점 폭이 대학별 환산에 미치는 영향을 분석하여 객관적인 합격선(Cut-line)을 예측",
        ],
      },
      {
        title: "검정고시 맞춤형 전형 탐색 및 지원 전략 수립",
        points: [
          "전국 주요 대학 중 검정고시 출신자의 지원 제한이 없는 전형을 꼼꼼하게 필터링",
          "일반 고등학생과 비교한 유불리를 철저히 계산하여 합격 확률이 높은 최적의 맞춤형 지원 카드를 도출",
        ],
      },
      {
        title: "합격하는 대체 서식(활동 증빙 서류) 기획 코칭",
        points: [
          "학종 지원 시 생기부를 대신해 평가받는 ‘활동 증빙 서류’의 올바른 작성 방향과 핵심 포인트를 코칭",
          "꿈드림 센터 활동·독서·자격증·자기주도학습 등 학교 밖 경험을 ‘전공 적합성’과 ‘학업 역량’에 맞게 스토리텔링하여 서류 경쟁력 극대화",
        ],
      },
      {
        title: "향후 학습 및 보완 로드맵 제시",
        points: [
          "컨설팅 시점 기준 남은 기간 동안 반드시 보완해야 할 요소들을 점검",
          "수능 최저학력기준 충족을 위한 과목별 학습 전략과 추가 비교과 활동 방향을 구체적으로 제시",
        ],
      },
    ],
  },

  setuk: {
    slug: "setuk",
    category: "학생부 · 자소서",
    name: "합격 생기부를 위한 세특 컨설팅",
    price: "과목당 600,000원",
    unit: "다회차 · 총 120분 분할진행",
    format: "대치 센터 방문 또는 온라인 상담 선택 가능",
    short: "목표 전공에 맞춘 세특으로 학생부 완성도를 극대화합니다.",
    intro:
      "학생의 목표 전공에 맞춰 세특을 완벽하게 차별화하고, 학교생활기록부의 완성도를 극대화하는 학생부 심화 프로그램입니다. 단순한 나열식 기재를 넘어, 전문가가 세특과 비교과 활동을 체계적으로 기획·관리합니다. 학생은 성적 향상에 집중하며 학생부종합전형에서 압도적인 결과를 얻을 수 있습니다.",
    targetLead: "대상 : 학생부종합전형을 준비하는 고등학생 및 학부모님",
    target: [
      "세특·비교과를 목표 전공에 맞춰 차별화하고 싶은 학생",
      "나열식 기재를 넘어 학업·진로 역량이 드러나는 학생부를 완성하고 싶은 학생",
    ],
    curIntro:
      "전공 적합성과 학업 탐구 역량이 돋보이도록 체계적인 단계별 코칭을 제공합니다.",
    curriculum: [
      {
        title: "학업·진로 역량 기반 맞춤형 주제 선정",
        points: [
          "진로 목표 및 교과 진도와 완벽하게 연계된 창의적인 심화 탐구 주제를 브레인스토밍",
          "대학이 요구하는 ‘학업 역량’과 ‘진로 역량’이 돋보일 수 있는 최적의 방향성을 설정",
        ],
      },
      {
        title: "탐구/실험 보고서 기획 및 작성 코칭",
        points: [
          "전공을 고려해 과목별 수행평가, 주제 탐구·실험 보고서, 발표 등 다양한 세특 산출물 작성을 안내",
          "탐구 동기·과정·결과·배우고 느낀 점이 논리적으로 담긴 보고서 뼈대를 함께 구축",
          "필요 시 진로 연계 도서를 활용하여 깊이 있는 세특 기재용 결과물을 도출",
        ],
      },
      {
        title: "개인별 최종 세특 기재 관리 (텍스트 정제)",
        points: [
          "작성된 결과물을 바탕으로 핵심 역량이 가장 잘 드러나도록 개인별 세특 기재 내용을 밀착 관리",
          "학교 선생님께 바로 제출할 수 있도록 정제되고 완성도 높은 최종 텍스트 가이드를 제공",
        ],
      },
    ],
  },

  jaso: {
    slug: "jaso",
    category: "학생부 · 자소서",
    name: "고입 자소서 프로그램",
    price: "600,000원",
    unit: "1회 120분",
    format: "대치 센터 방문 또는 온라인 상담 선택 가능",
    short: "특목·자사고 인재상에 부합하는 차별화된 자소서를 완성합니다.",
    intro:
      "특목고·자사고 진학을 목표로 하는 최상위권 중학생을 위한 프리미엄 자기소개서 코칭 프로그램입니다. 천편일률적인 자소서에서 벗어나, 목표 학교의 인재상에 정확히 부합하면서도 학생만의 고유한 매력과 잠재력이 돋보이는 차별화된 스토리텔링을 발굴하고 완성도 높은 결과물을 도출합니다.",
    targetLead: "대상 : 특목·자사고 진학을 준비하는 중학생 및 학부모님",
    target: [
      "영재고·과학고·외고·국제고 및 전국/광역 단위 자사고 진학을 준비하는 중학생",
      "활동은 풍부하게 했으나 자소서 문항에 맞춰 논리적·매력적으로 엮어내는 데 어려움을 겪는 학생",
      "본인의 강점을 객관적으로 파악하고 입학사정관의 시선을 사로잡는 임팩트 있는 글쓰기 코칭이 필요한 학생",
    ],
    curIntro:
      "120분 동안 막연했던 생각들을 구조화하고, 진정성 있는 본인만의 언어로 자소서를 완성하는 3단계 코칭을 진행합니다.",
    curriculum: [
      {
        title: "중학교 생활기록부 정밀 분석 및 스토리 발굴",
        points: [
          "작성 전, 중학교 생활기록부를 면밀히 분석하여 학업 역량과 인성을 보여줄 핵심 에피소드를 추출",
          "단순한 경험의 나열이 아닌, 지원 전공/학교와 연결될 가장 강력한 무기(강점)를 브레인스토밍으로 도출",
        ],
      },
      {
        title: "지원 학교 맞춤형 문항 구조화 (개요 작성)",
        points: [
          "목표 고등학교의 건학 이념·인재상과 각 자소서 문항이 요구하는 핵심 의도를 정확하게 분석",
          "발굴된 에피소드를 각 문항에 적절히 배치하고 ‘동기-과정-결과-변화’가 논리적으로 이어지는 글의 뼈대(개요)를 구축",
        ],
      },
      {
        title: "초안 작성 코칭 및 정밀 첨삭 (최종본 도출)",
        points: [
          "학생의 진정성이 훼손되지 않도록 본인만의 언어로 초안을 작성하게 코칭",
          "어색한 표현을 다듬고 설득력·가독성을 높이는 정밀 첨삭으로 완성도 높은 최종 자소서를 완성",
        ],
      },
    ],
  },

  "interview-content": {
    slug: "interview-content",
    category: "면접",
    name: "합격 면접 프로그램 〈내용설정〉",
    price: "600,000원",
    unit: "1회 120분",
    format: "대치 센터 방문 또는 온라인 상담 선택 가능",
    short: "서류 기반 예상 질문과 ‘킬러 답변’의 뼈대를 설계합니다.",
    intro:
      "학생부를 철저히 분석하여 면접관의 의도를 파악하고, 나만의 강력한 무기가 될 ‘킬러 답변’의 뼈대를 완성하는 면접 기초 체력 다지기 프로그램입니다. 내 서류에서 파생될 수 있는 질문을 예측하고 답변의 방향성을 잡아 불안감을 자신감으로 바꿔드립니다.",
    targetLead: "대상 : 대입·고입 면접을 준비하는 학생",
    target: [
      "면접 경험이 전무하여 어떤 질문이 나올지 몰라 막막하고 두려운 학생",
      "내 생기부 중 어떤 부분이 날카로운 면접 질문으로 들어올지 스스로 예측하기 어려운 학생",
      "답변은 머릿속에 맴돌지만 조리 있고 논리적으로 말하는 구조를 잡지 못하는 학생",
    ],
    curIntro:
      "120분 동안 내 서류를 객관적으로 분석하고, 어떤 질문에도 흔들리지 않는 답변의 기준을 세웁니다.",
    curriculum: [
      {
        title: "제출 서류 정밀 해체 및 분석",
        points: [
          "학생부(및 자소서) 기반 1:1 심층 분석으로 약점은 방어하고 강점은 부각할 핵심 포인트를 도출",
        ],
      },
      {
        title: "개인 맞춤형 예상 질문 추출",
        points: [
          "대학/고교별 기출 분석은 물론, 서류 진위 확인·전공 적합성 심층 질문·날카로운 꼬리 질문 리스트까지 철저하게 추출",
        ],
      },
      {
        title: "답변 스토리라인(키워드) 구조화 코칭",
        points: [
          "외운 티가 나는 딱딱한 문장형이 아닌, 자연스럽고 진정성 있는 답변을 코칭",
          "돌발·꼬리 질문에도 당황하지 않고 핵심을 전달하도록 ‘키워드 중심’의 논리적 답변 구조를 세팅",
        ],
      },
    ],
  },

  "interview-real": {
    slug: "interview-real",
    category: "면접",
    name: "합격 면접 프로그램 〈실전면접〉",
    price: "600,000원",
    unit: "1회 120분",
    format: "현장감 극대화를 위해 대면(방문) 진행 권장",
    short: "실전 압박 모의면접으로 면접 당일 퍼포먼스를 완성합니다.",
    intro:
      "실제 면접장과 완벽하게 동일한 긴장감 속에서 진행되는 강도 높은 실전 모의 면접 훈련입니다. 논리적인 답변 전개는 물론 시선 처리·발성·자세 등 비언어적 요소까지 완벽하게 교정하여 실전에서의 합격률을 최고조로 끌어올립니다.",
    targetLead: "대상 : 면접 답변 준비를 마치고 실전 훈련이 필요한 학생",
    target: [
      "면접 〈내용설정〉을 마쳤거나, 답변 준비는 끝났으나 실전 시뮬레이션 훈련이 필요한 학생",
      "긴장하면 말을 더듬거나 머릿속이 하얘져 준비한 답변을 100% 보여주지 못하는 학생",
      "시선 불안·부적절한 자세·작은 목소리 등 비언어적 습관의 객관적 진단과 집중 교정이 필요한 학생",
    ],
    curIntro:
      "120분 동안 실전과 같은 압박감 속에서 말하기 훈련을 반복하며 면접 당일의 퍼포먼스를 완성합니다.",
    curriculum: [
      {
        title: "실전 환경 모의 면접 진행",
        points: [
          "실제 면접관의 시선·압박 질문·돌발 상황을 그대로 구현한 강도 높은 롤플레이로 실전 감각을 극대화하고 멘탈을 강화",
        ],
      },
      {
        title: "비디오 촬영 및 객관적 피드백 진단",
        points: [
          "모의 면접 전 과정을 촬영하여 시선 처리·표정·발성·억양·자세 등을 학생 스스로 객관적으로 모니터링하고 문제점을 파악",
        ],
      },
      {
        title: "비언어적 태도 교정 및 파이널 코칭",
        points: [
          "설득력과 신뢰감을 떨어뜨리는 나쁜 습관을 즉각적으로 교정",
          "답변의 유창성을 높이고 당당한 자신감을 더해, 면접 당일 최상의 컨디션으로 임하도록 최종 점검",
        ],
      },
    ],
  },
};

const ORDER = ["premium", "susi", "jeongsi", "gumjeong", "setuk", "jaso", "interview-content", "interview-real"];
const CATEGORIES = [
  { key: "종합 진단", desc: "어디서부터 시작할지 막막하다면, 큰 그림부터.", slugs: ["premium"] },
  { key: "대입 전략", desc: "수시·정시·검정고시, 가장 유리한 길을 설계합니다.", slugs: ["susi", "jeongsi", "gumjeong"] },
  { key: "학생부 · 자소서", desc: "서류의 완성도가 합격의 격차를 만듭니다.", slugs: ["setuk", "jaso"] },
  { key: "면접", desc: "준비한 만큼, 당일에 100% 보여주도록.", slugs: ["interview-content", "interview-real"] },
];

// ─────────────────────────────────────────────────────────────
// 공통 렌더링
// ─────────────────────────────────────────────────────────────
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const CSS = `
:root{
  --ink:#0B1622;--navy:#13243A;--navy-2:#1B3150;
  --paper:#FBFAF7;--paper-cool:#EEF1F5;
  --signal:#C79A4B;--signal-bright:#E4B85F;
  --line:rgba(11,22,34,.12);--line-light:rgba(251,250,247,.16);
  --muted:#5A6573;--muted-light:rgba(251,250,247,.66);
  --serif:'Hahmlet',serif;--sans:'Pretendard',-apple-system,BlinkMacSystemFont,system-ui,sans-serif;
  --maxw:1180px;
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:var(--sans);background:var(--paper);color:var(--ink);line-height:1.65;-webkit-font-smoothing:antialiased;word-break:keep-all;overflow-x:hidden}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}
::selection{background:var(--signal);color:var(--ink)}
:focus-visible{outline:2px solid var(--signal);outline-offset:3px;border-radius:2px}
.wrap{max-width:var(--maxw);margin:0 auto;padding:0 28px}
.eyebrow{font-size:.78rem;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--signal);display:inline-flex;align-items:center;gap:10px}
.eyebrow::before{content:"";width:26px;height:1px;background:var(--signal)}
h1,h2,h3{font-family:var(--serif);font-weight:600;line-height:1.18;letter-spacing:-.01em}

header{position:fixed;top:0;left:0;right:0;z-index:100;transition:background .35s,box-shadow .35s,border-color .35s;border-bottom:1px solid transparent}
header.scrolled{background:rgba(251,250,247,.92);backdrop-filter:saturate(180%) blur(12px);border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;justify-content:space-between;height:78px}
.brand{display:flex;align-items:center;gap:11px;color:var(--paper)}
header.scrolled .brand{color:var(--ink)}
.brand b{font-family:var(--serif);font-size:1.18rem;font-weight:600;letter-spacing:-.01em;line-height:1.05}
.brand small{display:block;font-size:.6rem;font-weight:600;letter-spacing:.26em;color:var(--signal);text-transform:uppercase;margin-top:2px}
.navlinks{display:flex;align-items:center;gap:32px}
.navlinks a{font-size:.92rem;font-weight:500;color:var(--muted-light);transition:color .25s}
header.scrolled .navlinks a{color:var(--muted)}
.navlinks a:hover{color:var(--signal)}
header.scrolled .navlinks a:hover{color:var(--ink)}
.btn{display:inline-flex;align-items:center;gap:9px;font-family:var(--sans);font-size:.92rem;font-weight:600;padding:13px 24px;border-radius:2px;cursor:pointer;border:none;transition:transform .2s,background .25s,color .25s,box-shadow .25s;white-space:nowrap}
.btn-gold{background:var(--signal);color:var(--ink)}
.btn-gold:hover{background:var(--signal-bright);transform:translateY(-2px);box-shadow:0 10px 26px rgba(199,154,75,.34)}
.btn-ghost{background:transparent;color:var(--paper);border:1px solid var(--line-light)}
.btn-ghost:hover{border-color:var(--signal);color:var(--signal)}
.btn-dark{background:var(--ink);color:var(--paper)}
.btn-dark:hover{background:var(--navy);transform:translateY(-2px)}
.btn-line{background:transparent;color:var(--ink);border:1px solid var(--line)}
.btn-line:hover{border-color:var(--signal);color:var(--signal)}
.hamburger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:8px}
.hamburger span{width:24px;height:2px;background:var(--paper);transition:.3s}
header.scrolled .hamburger span{background:var(--ink)}

.reveal{opacity:0;transform:translateY(26px);transition:opacity .9s cubic-bezier(.2,.7,.2,1),transform .9s cubic-bezier(.2,.7,.2,1)}
.reveal.in{opacity:1;transform:none}
.d1{transition-delay:.08s}.d2{transition-delay:.16s}.d3{transition-delay:.24s}.d4{transition-delay:.32s}

.hero{position:relative;background:var(--ink);color:var(--paper);min-height:100vh;display:flex;align-items:center;padding:120px 0 70px;overflow:hidden}
.hero::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 90% at 78% 18%,rgba(199,154,75,.10),transparent 55%)}
.signal-bg{position:absolute;top:50%;right:-160px;transform:translateY(-50%);width:760px;height:760px;pointer-events:none}
.signal-bg .ring{fill:none;stroke:var(--signal);stroke-width:1;transform-origin:center;opacity:0}
.pulse .ring{animation:pulse 5.4s ease-out infinite}
.pulse .ring:nth-child(2){animation-delay:1.35s}
.pulse .ring:nth-child(3){animation-delay:2.7s}
.pulse .ring:nth-child(4){animation-delay:4.05s}
@keyframes pulse{0%{opacity:0;transform:scale(.18)}16%{opacity:.5}100%{opacity:0;transform:scale(1)}}
.sweep{transform-origin:380px 380px;animation:sweep 9s linear infinite}
@keyframes sweep{to{transform:rotate(360deg)}}
.hero-grid{position:relative;z-index:2;width:100%}
.hero-copy{max-width:660px}
.hero h1{font-size:clamp(2.4rem,5.4vw,4.05rem);margin:26px 0 24px}
.hero h1 .gold{color:var(--signal)}
.hero p.lead{font-size:1.08rem;color:var(--muted-light);max-width:540px;line-height:1.78}
.hero-cta{display:flex;gap:14px;margin-top:38px;flex-wrap:wrap}
.hero-trust{display:flex;gap:38px;margin-top:54px;padding-top:32px;border-top:1px solid var(--line-light);flex-wrap:wrap}
.hero-trust .num{font-family:var(--serif);font-size:1.85rem;font-weight:600;color:var(--paper);display:block}
.hero-trust .num em{font-style:normal;color:var(--signal);font-size:1.15rem}
.hero-trust .lab{font-size:.82rem;color:var(--muted-light);margin-top:2px}

section{padding:104px 0}
.sec-head{max-width:720px;margin-bottom:52px}
.sec-head h2{font-size:clamp(1.9rem,3.6vw,2.8rem);margin:20px 0 18px}
.sec-head p{color:var(--muted);font-size:1.04rem;line-height:1.8}

.programs{background:var(--paper-cool)}
.catblock{margin-bottom:54px}
.catblock:last-child{margin-bottom:0}
.cathead{display:flex;align-items:baseline;gap:16px;padding-bottom:18px;margin-bottom:24px;border-bottom:1px solid var(--line);flex-wrap:wrap}
.cathead h3{font-size:1.5rem}
.cathead span{color:var(--muted);font-size:.95rem}
.pgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.pcard{background:var(--paper);border:1px solid var(--line);padding:30px 28px 26px;display:flex;flex-direction:column;min-height:228px;transition:transform .35s,box-shadow .35s,border-color .35s;position:relative}
.pcard:hover{transform:translateY(-5px);box-shadow:0 24px 46px rgba(11,22,34,.10);border-color:transparent}
.pcard .pcat{font-size:.7rem;font-weight:700;letter-spacing:.14em;color:var(--signal);text-transform:uppercase}
.pcard h4{font-family:var(--serif);font-size:1.32rem;font-weight:600;margin:12px 0 10px;line-height:1.3}
.pcard p{font-size:.94rem;color:var(--muted);line-height:1.62;margin-bottom:18px}
.pcard .pmeta{margin-top:auto;display:flex;align-items:center;justify-content:space-between;padding-top:16px;border-top:1px solid var(--line)}
.pcard .price{font-family:var(--serif);font-size:1.04rem;color:var(--ink)}
.pcard .price em{font-style:normal;color:var(--muted);font-size:.8rem;font-family:var(--sans);margin-left:4px}
.pcard .go{font-size:.86rem;font-weight:600;color:var(--signal);display:inline-flex;align-items:center;gap:6px;transition:gap .2s}
.pcard:hover .go{gap:11px}

.process{background:var(--ink);color:var(--paper)}
.process .sec-head h2{color:var(--paper)}
.process .sec-head p{color:var(--muted-light)}
.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-top:14px}
.step{padding:34px 26px 30px 0;border-top:2px solid var(--line-light);position:relative}
.step::before{content:"";position:absolute;top:-6px;left:0;width:10px;height:10px;border-radius:50%;background:var(--signal);box-shadow:0 0 0 5px rgba(199,154,75,.18)}
.step .sn{font-family:var(--serif);font-size:.92rem;color:var(--signal);font-weight:600;letter-spacing:.08em}
.step h4{font-family:var(--sans);font-size:1.2rem;font-weight:600;margin:13px 0 11px}
.step p{font-size:.92rem;color:var(--muted-light);line-height:1.7}

.contact{background:var(--paper)}
.contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:start}
.contact h2{font-size:clamp(2rem,4vw,2.9rem);margin:18px 0 22px;line-height:1.2}
.contact h2 .gold{color:var(--signal)}
.contact .lead{color:var(--muted);font-size:1.04rem;line-height:1.85;max-width:440px}
.channels{margin-top:34px}
.channel{display:flex;align-items:center;gap:16px;padding:17px 0;border-top:1px solid var(--line)}
.channel:last-child{border-bottom:1px solid var(--line)}
.channel .ic{color:var(--signal);flex-shrink:0}
.channel b{display:block;font-size:1.02rem;font-weight:600}
.channel span{font-size:.86rem;color:var(--muted)}
form.inq{background:var(--ink);padding:40px 38px 36px;color:var(--paper)}
form.inq h3{font-size:1.4rem;color:var(--paper);margin-bottom:6px}
form.inq .fdesc{color:var(--muted-light);font-size:.9rem;margin-bottom:24px}
.field{margin-bottom:17px}
.field label{display:block;font-size:.8rem;font-weight:600;letter-spacing:.03em;margin-bottom:8px;color:var(--muted-light)}
.field input,.field select,.field textarea{width:100%;background:rgba(251,250,247,.05);border:1px solid var(--line-light);color:var(--paper);padding:13px 15px;font-family:var(--sans);font-size:.95rem;border-radius:2px;transition:border-color .25s,background .25s}
.field input::placeholder,.field textarea::placeholder{color:rgba(251,250,247,.4)}
.field input:focus,.field select:focus,.field textarea:focus{outline:none;border-color:var(--signal);background:rgba(199,154,75,.06)}
.field select{appearance:none;cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23C79A4B' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 15px center;padding-right:38px}
.field select option{background:var(--ink);color:var(--paper)}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:14px}
form.inq .btn-gold{width:100%;justify-content:center;margin-top:6px;padding:15px}
.form-msg{margin-top:14px;font-size:.9rem;text-align:center;min-height:20px;color:var(--signal-bright)}
.form-msg.err{color:#E9A0A0}
.form-msg.ok{color:var(--signal-bright)}
.consent{font-size:.76rem;color:var(--muted-light);margin-top:12px;text-align:center;line-height:1.6}

.dhero{background:var(--ink);color:var(--paper);padding:138px 0 70px;position:relative;overflow:hidden}
.dhero::after{content:"";position:absolute;inset:0;background:radial-gradient(110% 80% at 88% 12%,rgba(199,154,75,.10),transparent 55%);pointer-events:none}
.crumb{font-size:.84rem;color:var(--muted-light);margin-bottom:22px;position:relative;z-index:2}
.crumb a:hover{color:var(--signal)}
.dhero h1{font-size:clamp(2rem,4.4vw,3.2rem);margin:14px 0 20px;position:relative;z-index:2;max-width:780px}
.dhero .dintro{color:var(--muted-light);font-size:1.05rem;line-height:1.85;max-width:680px;position:relative;z-index:2}
.dbadges{display:flex;gap:10px;flex-wrap:wrap;margin:24px 0 0;position:relative;z-index:2}
.badge{font-size:.82rem;color:var(--paper);border:1px solid var(--line-light);padding:8px 14px;border-radius:2px;display:inline-flex;align-items:center;gap:7px}
.badge.gold{border-color:var(--signal);color:var(--signal-bright)}
.dcta{display:flex;gap:13px;margin-top:32px;flex-wrap:wrap;position:relative;z-index:2}

.dbody{padding:88px 0}
.dbody-grid{display:grid;grid-template-columns:330px 1fr;gap:56px;align-items:start}
.side{position:sticky;top:104px}
.pricecard{background:var(--ink);color:var(--paper);padding:26px 26px 24px;margin-bottom:24px}
.pricecard .pl{font-size:.74rem;letter-spacing:.16em;text-transform:uppercase;color:var(--signal)}
.pricecard .pp{font-family:var(--serif);font-size:1.7rem;margin:8px 0 2px}
.pricecard .pu{font-size:.86rem;color:var(--muted-light)}
.pricecard .pf{font-size:.82rem;color:var(--muted-light);margin-top:14px;padding-top:14px;border-top:1px solid var(--line-light);line-height:1.6}
.pricecard .btn{width:100%;justify-content:center;margin-top:18px}
.sidebox{border:1px solid var(--line);padding:24px 24px 22px;margin-bottom:18px}
.sidebox h5{font-size:.76rem;letter-spacing:.14em;text-transform:uppercase;color:var(--signal);margin-bottom:14px}
.sidebox .lead{font-size:.9rem;color:var(--ink);font-weight:600;margin-bottom:14px;line-height:1.55}
.tlist{list-style:none}
.tlist li{font-size:.92rem;color:var(--muted);line-height:1.62;padding:9px 0 9px 22px;position:relative;border-top:1px solid var(--line)}
.tlist li:first-child{border-top:none}
.tlist li::before{content:"";position:absolute;left:0;top:16px;width:8px;height:8px;border-radius:50%;border:1.5px solid var(--signal)}
.tip{background:var(--paper-cool);border-left:3px solid var(--signal);padding:18px 20px}
.tip h5{font-size:.74rem;letter-spacing:.14em;text-transform:uppercase;color:var(--signal);margin-bottom:8px}
.tip p{font-size:.88rem;color:var(--muted);line-height:1.66}

.curhead{margin-bottom:8px}
.curhead .eyebrow{margin-bottom:14px}
.curhead h2{font-size:1.9rem;margin-bottom:14px}
.curhead p{color:var(--muted);font-size:1rem;line-height:1.8;max-width:640px;margin-bottom:36px}
.cstep{display:grid;grid-template-columns:64px 1fr;gap:8px;padding:30px 0;border-top:1px solid var(--line)}
.cstep:first-of-type{border-top:2px solid var(--ink)}
.cstep .cn{font-family:var(--serif);font-size:1.5rem;color:var(--signal);font-weight:600;line-height:1.2}
.cstep h4{font-family:var(--sans);font-size:1.18rem;font-weight:600;margin-bottom:14px}
.cpoints{list-style:none}
.cpoints li{font-size:.96rem;color:var(--muted);line-height:1.7;padding:7px 0 7px 20px;position:relative}
.cpoints li::before{content:"";position:absolute;left:0;top:14px;width:7px;height:1.5px;background:var(--signal)}

.related{background:var(--paper-cool);padding:88px 0}
.related .sec-head{margin-bottom:36px}
.dcontact{background:var(--ink);color:var(--paper);padding:96px 0;text-align:center}
.dcontact h2{font-size:clamp(1.8rem,3.4vw,2.6rem);color:var(--paper);margin-bottom:16px}
.dcontact h2 .gold{color:var(--signal)}
.dcontact p{color:var(--muted-light);font-size:1.02rem;max-width:520px;margin:0 auto 30px;line-height:1.8}

footer{background:var(--ink);color:var(--muted-light);padding:62px 0 38px;border-top:1px solid var(--line-light)}
.foot-top{display:flex;justify-content:space-between;align-items:flex-start;gap:40px;flex-wrap:wrap;padding-bottom:38px;border-bottom:1px solid var(--line-light)}
.foot-brand b{font-family:var(--serif);color:var(--paper);font-size:1.3rem;display:block;margin-bottom:10px}
.foot-brand p{font-size:.9rem;max-width:360px;line-height:1.7}
.foot-cols{display:flex;gap:60px}
.foot-col h6{color:var(--paper);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;margin-bottom:15px;font-weight:600}
.foot-col a{display:block;font-size:.9rem;margin-bottom:10px;transition:color .2s}
.foot-col a:hover{color:var(--signal)}
.foot-bottom{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;padding-top:28px;font-size:.8rem}
.foot-bottom .legal{opacity:.7;line-height:1.7}

@media(max-width:980px){
  .contact-grid{grid-template-columns:1fr;gap:42px}
  .steps{grid-template-columns:1fr 1fr;gap:6px 24px}
  .dbody-grid{grid-template-columns:1fr;gap:36px}
  .side{position:static}
  .foot-top{flex-direction:column}
}
@media(max-width:640px){
  .wrap{padding:0 20px}
  section{padding:74px 0}
  .navlinks{display:none;position:absolute;top:78px;left:0;right:0;flex-direction:column;gap:0;background:var(--paper);border-bottom:1px solid var(--line);padding:8px 20px 20px}
  .navlinks.open{display:flex}
  .navlinks a{color:var(--ink);padding:14px 0;border-bottom:1px solid var(--line);width:100%}
  .navlinks .btn{margin-top:14px;width:100%;justify-content:center}
  .hamburger{display:flex}
  .steps{grid-template-columns:1fr}
  .frow{grid-template-columns:1fr}
  form.inq{padding:32px 22px}
  .cstep{grid-template-columns:1fr;gap:10px}
  .dbody{padding:64px 0}
}
@media(prefers-reduced-motion:reduce){
  *{animation:none!important;transition:none!important}
  .reveal{opacity:1;transform:none}
  html{scroll-behavior:auto}
}
`;

const HEAD_FONTS = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link href="https://fonts.googleapis.com/css2?family=Hahmlet:wght@400;500;600;700&display=swap" rel="stylesheet">`;

const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%230B1622'/%3E%3Ccircle cx='16' cy='16' r='3' fill='%23C79A4B'/%3E%3Cpath d='M16 9a7 7 0 0 1 7 7' stroke='%23C79A4B' stroke-width='1.6' fill='none' stroke-linecap='round'/%3E%3C/svg%3E";

const MARK = `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true"><circle cx="17" cy="17" r="3.4" fill="#C79A4B"/><path d="M17 8.5a8.5 8.5 0 0 1 8.5 8.5" stroke="#C79A4B" stroke-width="1.6" stroke-linecap="round"/><path d="M17 4a13 13 0 0 1 13 13" stroke="#C79A4B" stroke-width="1.4" stroke-linecap="round" opacity=".55"/></svg>`;

function header() {
  return `<header id="site-header"><div class="wrap nav">
<a href="/" class="brand" aria-label="${SITE.brand} 홈">${MARK}<span style="line-height:1"><b>${SITE.brand}</b><small>${SITE.brandEn}</small></span></a>
<nav class="navlinks" id="navlinks">
<a href="/#programs">프로그램</a>
<a href="/#process">프로세스</a>
<a href="/#contact">상담 안내</a>
<a href="/#contact" class="btn btn-gold">상담 신청</a>
</nav>
<button class="hamburger" id="burger" aria-label="메뉴 열기" aria-expanded="false"><span></span><span></span><span></span></button>
</div></header>`;
}

function footer() {
  const links = ORDER.slice(0, 4).map((s) => `<a href="/program/${s}">${esc(PROGRAMS[s].name)}</a>`).join("");
  return `<footer><div class="wrap">
<div class="foot-top">
<div class="foot-brand"><b>${SITE.brand}</b><p>${SITE.tagline}. 생기부·수시·정시, 학생 한 명의 데이터를 끝까지 읽어 가장 확실한 합격 전략을 설계합니다.</p></div>
<div class="foot-cols">
<div class="foot-col"><h6>프로그램</h6>${links}</div>
<div class="foot-col"><h6>바로가기</h6><a href="/#programs">전체 프로그램</a><a href="/#process">프로세스</a><a href="/#contact">상담 신청</a></div>
</div></div>
<div class="foot-bottom">
<p class="legal">상호 ${SITE.brand} · ${SITE.addr} · 대표전화 ${SITE.tel}<br>© ${new Date().getFullYear()} ${SITE.brandEn}. All rights reserved.</p>
<p>${SITE.tagline}</p>
</div></div></footer>`;
}

const PAGE_SCRIPT = `<script>
(function(){
var h=document.getElementById('site-header');
function s(){ if(window.scrollY>40){h.classList.add('scrolled');}else{h.classList.remove('scrolled');} }
s();window.addEventListener('scroll',s,{passive:true});
var b=document.getElementById('burger'),l=document.getElementById('navlinks');
if(b&&l){b.addEventListener('click',function(){var o=l.classList.toggle('open');b.setAttribute('aria-expanded',o);});
l.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){l.classList.remove('open');b.setAttribute('aria-expanded',false);});});}
var rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!rm&&'IntersectionObserver' in window){
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:0.14,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});
}else{document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('in');});}
var f=document.getElementById('inquiryForm');
if(f){f.addEventListener('submit',function(e){e.preventDefault();
var m=document.getElementById('formMsg');
var g=function(id){return document.getElementById(id);};
var name=g('iq_name').value.trim(),phone=g('iq_phone').value.trim();
if(!name||!phone){m.textContent='성함과 연락처를 입력해 주세요.';m.className='form-msg err';return;}
var payload={name:name,phone:phone,grade:g('iq_grade').value,program:g('iq_program').value,mode:g('iq_mode').value,message:g('iq_message').value.trim()};
m.textContent='신청을 접수하고 있습니다...';m.className='form-msg';
fetch('/api/inquiry',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)})
.then(function(r){return r.json();})
.then(function(d){if(d&&d.ok){f.reset();m.textContent='\\u2713 상담 신청이 접수되었습니다. 빠르게 연락드리겠습니다.';m.className='form-msg ok';}else{m.textContent=(d&&d.error)||'잠시 후 다시 시도해 주세요.';m.className='form-msg err';}})
.catch(function(){m.textContent='전송 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';m.className='form-msg err';});
});}
})();
</script>`;

function layout(title, desc, body) {
  return `<!doctype html><html lang="ko"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE.url}/">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}"><meta property="og:locale" content="ko_KR">
<link rel="icon" href="${FAVICON}">
${HEAD_FONTS}
<style>${CSS}</style>
</head><body>
${header()}
${body}
${footer()}
${PAGE_SCRIPT}
</body></html>`;
}

// ── 메인페이지 ──
function programCard(slug) {
  const p = PROGRAMS[slug];
  return `<a class="pcard reveal" href="/program/${p.slug}">
<span class="pcat">${esc(p.category)}</span>
<h4>${esc(p.name)}</h4>
<p>${esc(p.short)}</p>
<span class="pmeta"><span class="price">${esc(p.price)}<em>${esc(p.unit)}</em></span><span class="go">자세히 보기 →</span></span>
</a>`;
}

function renderMain() {
  const cats = CATEGORIES.map((c) => `
<div class="catblock">
<div class="cathead reveal"><h3>${esc(c.key)}</h3><span>${esc(c.desc)}</span></div>
<div class="pgrid">${c.slugs.map(programCard).join("")}</div>
</div>`).join("");

  const programOptions = ORDER.map((s) => `<option>${esc(PROGRAMS[s].name)}</option>`).join("") + `<option>통합 로드맵 / 기타</option>`;

  const body = `
<section class="hero">
<svg class="signal-bg pulse" viewBox="0 0 760 760" aria-hidden="true">
<g class="sweep" opacity=".18"><line x1="380" y1="380" x2="380" y2="40" stroke="#C79A4B" stroke-width="1"/></g>
<circle class="ring" cx="380" cy="380" r="360"/><circle class="ring" cx="380" cy="380" r="360"/><circle class="ring" cx="380" cy="380" r="360"/><circle class="ring" cx="380" cy="380" r="360"/>
<circle cx="380" cy="380" r="5" fill="#C79A4B"/>
<circle cx="380" cy="380" r="60" fill="none" stroke="#C79A4B" stroke-width="1" opacity=".35"/>
<circle cx="380" cy="380" r="140" fill="none" stroke="#C79A4B" stroke-width="1" opacity=".22"/>
<circle cx="380" cy="380" r="240" fill="none" stroke="#C79A4B" stroke-width="1" opacity=".12"/>
</svg>
<div class="wrap hero-grid"><div class="hero-copy">
<span class="eyebrow reveal">${esc(SITE.tagline)}</span>
<h1 class="reveal d1">입시의 소음 속에서,<br><span class="gold">합격의 신호</span>를 읽다</h1>
<p class="lead reveal d2">수많은 전형과 변수 앞에서 길을 잃지 않도록. 생기부 설계부터 수시·정시·면접까지, 학생 한 명의 데이터를 끝까지 읽어 가장 확실한 합격 경로를 설계합니다.</p>
<div class="hero-cta reveal d3"><a href="#programs" class="btn btn-gold">프로그램 보기 →</a><a href="#contact" class="btn btn-ghost">1:1 상담 신청</a></div>
<div class="hero-trust reveal d4">
<div><span class="num">8<em>개 프로그램</em></span><span class="lab">진단 · 수시 · 정시 · 면접</span></div>
<div><span class="num">10<em>년+</em></span><span class="lab">선별된 전문가 컨설팅</span></div>
<div><span class="num">1:1</span><span class="lab">학생별 전담 맞춤 설계</span></div>
</div>
</div></div>
</section>

<section class="programs" id="programs">
<div class="wrap">
<div class="sec-head reveal"><span class="eyebrow">프로그램</span><h2>필요한 단계에 맞춰<br>정확한 컨설팅을 선택하세요</h2><p>모든 프로그램은 대치 센터 방문 또는 온라인 상담으로 진행되며, 학생의 학년·목표에 따라 단일 프로그램 또는 통합 로드맵으로 설계할 수 있습니다.</p></div>
${cats}
</div>
</section>

<section class="process" id="process">
<div class="wrap">
<div class="sec-head reveal"><span class="eyebrow">컨설팅 프로세스</span><h2>진단에서 합격까지,<br>네 단계로 동행합니다</h2><p>한 번의 상담으로 끝나지 않습니다. 합격이라는 결과가 나올 때까지 단계별로 함께합니다.</p></div>
<div class="steps">
<div class="step reveal d1"><div class="sn">STEP 01</div><h4>진단</h4><p>성적·생기부·목표 대학을 종합 분석해 현재 위치와 격차를 정확히 파악합니다.</p></div>
<div class="step reveal d2"><div class="sn">STEP 02</div><h4>설계</h4><p>진단 결과를 토대로 학생만을 위한 맞춤 합격 로드맵과 지원 전략을 수립합니다.</p></div>
<div class="step reveal d3"><div class="sn">STEP 03</div><h4>실행 · 관리</h4><p>월별 점검으로 전략의 실행을 관리하고, 변화하는 상황에 맞춰 계획을 조정합니다.</p></div>
<div class="step reveal d4"><div class="sn">STEP 04</div><h4>합격</h4><p>원서 접수 전략과 면접·논술 대비까지, 최종 합격선에서 마지막을 함께 마무리합니다.</p></div>
</div>
</div>
</section>

<section class="contact" id="contact">
<div class="wrap contact-grid">
<div class="reveal">
<span class="eyebrow">상담 신청</span>
<h2>합격의 신호는<br>지금 <span class="gold">상담</span>에서 시작됩니다</h2>
<p class="lead">간단한 정보만 남겨주시면, 전담 컨설턴트가 영업일 기준 24시간 내에 연락드립니다. 첫 진단 상담으로 현재 위치와 합격 가능성을 확인해 보세요.</p>
<div class="channels">
<div class="channel"><svg class="ic" width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v14H4z" stroke="currentColor" stroke-width="1.6"/><path d="M4 6l8 6 8-6" stroke="currentColor" stroke-width="1.6"/></svg><div><b>이메일 상담</b><span>${SITE.email}</span></div></div>
<div class="channel"><svg class="ic" width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke="currentColor" stroke-width="1.6"/><path d="M10 18h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><div><b>전화 상담</b><span>${SITE.tel} · 평일 10:00–21:00</span></div></div>
<div class="channel"><svg class="ic" width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7-.2.7-.8 2.6-.9 3-.1.5.2.5.4.4.2-.1 2.6-1.8 3.7-2.5.7.1 1.4.2 2.1.2 5.5 0 10-3.6 10-8S17.5 3 12 3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg><div><b>카카오톡 상담</b><span>채널 검색 · ${SITE.kakao}</span></div></div>
<div class="channel"><svg class="ic" width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.4" stroke="currentColor" stroke-width="1.6"/></svg><div><b>오시는 길</b><span>${SITE.addr} · 대치 센터</span></div></div>
</div>
</div>
<form class="inq reveal d2" id="inquiryForm" novalidate>
<h3>1:1 상담 신청</h3>
<p class="fdesc">남겨주시면 빠르게 연락드리겠습니다.</p>
<div class="frow">
<div class="field"><label for="iq_name">성함</label><input id="iq_name" type="text" placeholder="학생 또는 학부모 성함" required></div>
<div class="field"><label for="iq_phone">연락처</label><input id="iq_phone" type="tel" placeholder="010-0000-0000" required></div>
</div>
<div class="frow">
<div class="field"><label for="iq_grade">학년</label><select id="iq_grade"><option value="">선택</option><option>중등(고입)</option><option>예비 고1</option><option>고1</option><option>고2</option><option>고3</option><option>N수 · 재수</option><option>검정고시</option></select></div>
<div class="field"><label for="iq_mode">상담 방식</label><select id="iq_mode"><option value="">선택</option><option>대치 센터 방문</option><option>온라인 상담</option></select></div>
</div>
<div class="field"><label for="iq_program">관심 프로그램</label><select id="iq_program"><option value="">선택</option>${programOptions}</select></div>
<div class="field"><label for="iq_message">상담 내용 (선택)</label><textarea id="iq_message" rows="3" placeholder="현재 고민이나 목표 대학을 적어주시면 상담에 도움이 됩니다."></textarea></div>
<button type="submit" class="btn btn-gold">상담 신청하기 →</button>
<p class="form-msg" id="formMsg" role="status"></p>
<p class="consent">신청 시 개인정보 수집·이용(상담 목적)에 동의하는 것으로 간주됩니다.</p>
</form>
</div>
</section>`;

  return layout(`${SITE.brand} · ${SITE.tagline}`,
    `${SITE.tagline} ${SITE.brand}. 생기부·수시·정시·면접 컨설팅으로 학생 한 명의 데이터를 끝까지 읽어 가장 확실한 합격 전략을 설계합니다.`,
    body);
}

// ── 상세페이지 ──
function renderDetail(p) {
  const steps = p.curriculum.map((c, i) => `
<div class="cstep reveal">
<div class="cn">${String(i + 1).padStart(2, "0")}</div>
<div><h4>${esc(c.title)}</h4><ul class="cpoints">${c.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
</div>`).join("");

  const targetList = (p.target || []).map((t) => `<li>${esc(t)}</li>`).join("");
  const tipBox = p.tip ? `<div class="tip"><h5>TIP</h5><p>${esc(p.tip)}</p></div>` : "";
  const targetLead = p.targetLead ? `<p class="lead">${esc(p.targetLead)}</p>` : "";

  const related = ORDER.filter((s) => s !== p.slug).slice(0, 3).map(programCard).join("");

  const body = `
<section class="dhero">
<div class="wrap">
<div class="crumb"><a href="/">${esc(SITE.brand)}</a> &nbsp;/&nbsp; <a href="/#programs">프로그램</a> &nbsp;/&nbsp; ${esc(p.category)}</div>
<span class="eyebrow">단기 프로그램 · ${esc(p.category)}</span>
<h1>${esc(p.name)}</h1>
<p class="dintro">${esc(p.intro)}</p>
<div class="dbadges">
<span class="badge gold">${esc(p.price)} · ${esc(p.unit)}</span>
<span class="badge">${esc(p.format)}</span>
</div>
<div class="dcta"><a href="/#contact" class="btn btn-gold">이 프로그램 상담 신청 →</a><a href="/#programs" class="btn btn-ghost">전체 프로그램</a></div>
</div>
</section>

<section class="dbody">
<div class="wrap dbody-grid">
<aside class="side">
<div class="pricecard reveal">
<div class="pl">PROGRAM</div>
<div class="pp">${esc(p.price)}</div>
<div class="pu">${esc(p.unit)}</div>
<div class="pf">${esc(p.format)}</div>
<a href="/#contact" class="btn btn-gold">상담 신청하기</a>
</div>
${targetList ? `<div class="sidebox reveal d1"><h5>추천 대상</h5>${targetLead}<ul class="tlist">${targetList}</ul></div>` : ""}
${tipBox}
</aside>
<div class="cur">
<div class="curhead reveal"><span class="eyebrow">상세 커리큘럼</span><h2>이렇게 진행됩니다</h2><p>${esc(p.curIntro)}</p></div>
${steps}
</div>
</div>
</section>

<section class="related">
<div class="wrap">
<div class="sec-head reveal"><span class="eyebrow">다른 프로그램</span><h2>함께 보면 좋은 컨설팅</h2></div>
<div class="pgrid">${related}</div>
</div>
</section>

<section class="dcontact">
<div class="wrap">
<h2>합격의 신호는 지금 <span class="gold">상담</span>에서 시작됩니다</h2>
<p>전담 컨설턴트가 영업일 기준 24시간 내에 연락드립니다. 부담 없이 현재 상황부터 진단해 보세요.</p>
<a href="/#contact" class="btn btn-gold">1:1 상담 신청하기 →</a>
</div>
</section>`;

  return layout(`${esc(p.name)} · ${SITE.brand}`, `${esc(p.short)} ${esc(p.price)} ${esc(p.unit)}. ${SITE.tagline} ${SITE.brand}.`, body);
}

function notFound() {
  const body = `<section class="dhero"><div class="wrap">
<div class="crumb"><a href="/">${SITE.brand}</a></div>
<h1>페이지를 찾을 수 없습니다</h1>
<p class="dintro">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
<div class="dcta"><a href="/" class="btn btn-gold">홈으로 →</a><a href="/#programs" class="btn btn-ghost">전체 프로그램</a></div>
</div></section>`;
  return layout(`페이지 없음 · ${SITE.brand}`, "페이지를 찾을 수 없습니다.", body);
}

// ─────────────────────────────────────────────────────────────
// 상담 신청 처리
// ─────────────────────────────────────────────────────────────
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8" } });
}

async function handleInquiry(request, env) {
  let data;
  try { data = await request.json(); } catch { return json({ ok: false, error: "요청 형식이 올바르지 않습니다." }, 400); }

  const name = (data.name || "").toString().trim();
  const phone = (data.phone || "").toString().trim();
  if (!name || !phone) return json({ ok: false, error: "성함과 연락처를 입력해 주세요." }, 400);

  const atDisplay = new Date().toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true,
  });
  const record = {
    site: (env && env.BRAND_NAME) || SITE.brand,
    name, phone,
    grade: (data.grade || "").toString().trim(),
    program: (data.program || "").toString().trim(),
    mode: (data.mode || "").toString().trim(),
    message: (data.message || "").toString().trim(),
    at: new Date().toISOString(), atDisplay,
  };

  // 1) 이메일 알림 (Cloudflare Email Routing) — env.NOTIFY + env.NOTIFY_TO 있을 때만
  try {
    if (env && env.NOTIFY && env.NOTIFY_TO) {
      const { EmailMessage } = await import("cloudflare:email");
      const from = env.NOTIFY_FROM || ("noreply@" + new URL(SITE.url).host);
      const subject = "[" + record.site + "] 상담 신청 - " + name + (record.program ? " (" + record.program + ")" : "");
      const raw = buildMime({ from, fromName: record.site, to: env.NOTIFY_TO, subject, html: renderEmailHtml(record) });
      await env.NOTIFY.send(new EmailMessage(from, env.NOTIFY_TO, raw));
    }
  } catch (e) { console.log("알림 메일 실패:", e && e.message ? e.message : e); }

  // 2) 구글 시트 기록 — env.SHEET_WEBHOOK_URL 있을 때만
  try {
    if (env && env.SHEET_WEBHOOK_URL) {
      await fetch(env.SHEET_WEBHOOK_URL, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(record) });
    }
  } catch (e) { console.log("시트 기록 실패:", e && e.message ? e.message : e); }

  console.log("새 상담 신청:", JSON.stringify(record));
  return json({ ok: true });
}

function encodeWord(s) { return "=?UTF-8?B?" + btoa(String.fromCharCode(...new TextEncoder().encode(s))) + "?="; }
function escapeHtml(s) { return esc(s); }

function buildMime({ from, fromName, to, subject, html }) {
  const fromHeader = fromName ? encodeWord(fromName) + " <" + from + ">" : from;
  const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(html)));
  const wrapped = (b64.match(/.{1,76}/g) || [b64]).join("\r\n");
  const headers = [
    "From: " + fromHeader, "To: " + to, "Subject: " + encodeWord(subject),
    "MIME-Version: 1.0", "Content-Type: text/html; charset=utf-8", "Content-Transfer-Encoding: base64",
  ];
  return headers.join("\r\n") + "\r\n\r\n" + wrapped + "\r\n";
}

function renderEmailHtml(r) {
  const tel = String(r.phone).replace(/[^0-9+]/g, "");
  const gold = "#C79A4B", ink = "#0B1622", line = "#E6E2DA", soft = "#F4EFE3";
  const cell = "padding:13px 0;font-size:13px;color:#8A8578;width:96px;vertical-align:top;";
  const val = "padding:13px 0;font-size:15px;font-weight:700;color:" + ink + ";border-bottom:1px solid " + line + ";";
  const row = (k, v) => '<tr><td style="' + cell + '">' + k + '</td><td style="' + val + '">' + escapeHtml(v || "-") + '</td></tr>';
  let rows = row("성함", r.name);
  rows += '<tr><td style="' + cell + '">연락처</td><td style="padding:13px 0;border-bottom:1px solid ' + line + ';"><a href="tel:' + tel + '" style="color:' + gold + ';font-size:17px;font-weight:800;text-decoration:none;">' + escapeHtml(r.phone) + '</a></td></tr>';
  rows += row("학년", r.grade) + row("관심 프로그램", r.program) + row("상담 방식", r.mode);
  rows += '<tr><td style="' + cell + '">상담 내용</td><td style="padding:13px 0;font-size:14px;line-height:1.6;color:' + ink + ';">' + (r.message ? escapeHtml(r.message).replace(/\n/g, "<br>") : "-") + '</td></tr>';
  return '<!doctype html><html><body style="margin:0;padding:24px 12px;background:#F3F2EE;font-family:-apple-system,BlinkMacSystemFont,Apple SD Gothic Neo,Malgun Gothic,sans-serif;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:6px;overflow:hidden;box-shadow:0 10px 30px rgba(11,22,34,.10);">' +
    '<tr><td style="background:' + ink + ';padding:28px 32px;"><div style="color:' + gold + ';font-size:12px;font-weight:700;letter-spacing:1px;margin-bottom:6px;">' + escapeHtml(r.site) + ' · 새 상담 신청</div>' +
    '<div style="color:#fff;font-size:22px;font-weight:800;">새 상담 신청이 도착했습니다</div></td></tr>' +
    '<tr><td style="padding:6px 32px 4px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + rows + '</table></td></tr>' +
    '<tr><td style="padding:14px 32px 24px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + soft + ';border-left:3px solid ' + gold + ';border-radius:4px;"><tr><td style="padding:14px 16px;">' +
    '<div style="color:' + ink + ';font-size:13px;font-weight:700;margin-bottom:10px;">빠른 연락이 상담 성사율을 높입니다</div>' +
    '<a href="tel:' + tel + '" style="display:inline-block;background:' + ink + ';color:#fff;font-size:14px;font-weight:800;text-decoration:none;padding:10px 20px;border-radius:4px;">전화 걸기</a>' +
    '</td></tr></table></td></tr>' +
    '<tr><td style="padding:14px 32px 24px;border-top:1px solid ' + line + ';text-align:center;"><span style="color:#A6A092;font-size:12px;">신청 시각: ' + escapeHtml(r.atDisplay) + '</span></td></tr>' +
    '</table></body></html>';
}

// ─────────────────────────────────────────────────────────────
// 라우팅
// ─────────────────────────────────────────────────────────────
const htmlResponse = (s, status = 200) => new Response(s, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" } });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "POST" && path === "/api/inquiry") return handleInquiry(request, env);
    if (path === "/" || path === "/index.html") return htmlResponse(renderMain());

    const m = path.match(/^\/program\/([a-z-]+)$/);
    if (m && PROGRAMS[m[1]]) return htmlResponse(renderDetail(PROGRAMS[m[1]]));

    if (path === "/robots.txt") {
      return new Response("User-agent: *\nAllow: /\n", { headers: { "content-type": "text/plain; charset=utf-8" } });
    }
    return htmlResponse(notFound(), 404);
  },
};

export { renderMain, renderDetail, PROGRAMS, ORDER, SITE };
