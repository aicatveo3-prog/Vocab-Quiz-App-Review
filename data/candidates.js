/* 조사 예정 후보 앱 — 아직 리뷰를 수집하지 않은 앱 목록(사람이 쓴 글, 화면은 js/app.js 의 candCard).
   출처: 구글 플레이 검색(공무원 영어·어휘·기출 관련 검색어 약 40개)과 앱 상세 페이지의 표시값, 2026-10-20.
   조사를 마친 앱은 이 목록에서 지우고 data/apps.js(build_site.py)로 옮긴다. */
window.CANDIDATES = {
  date: '2026-10-20',
  note: '아직 리뷰를 수집하지 않은 후보예요. 카드를 누르면 구글 플레이 페이지가 새 창으로 열려요. 다운로드·평점은 플레이스토어에 표시된 값이에요.',
  items: [
    { id: 'kr.slingcorp.orzocsat', name: '오르조: 기출문제, 수능·내신·공무원·자격증CBT·토익', dev: 'Sling Inc', group: '기출 문제풀이', dlNum: 500000, dl: '50만+', score: '4.7', n: 3645, updated: '2026-10-16', memo: '수능·공무원·자격증을 한 앱에서. 가장 큰 공무원 기출 앱' },
    { id: 'net.eduwill.study', name: '에듀윌 합격앱 - 공무원/공인중개사 특강, 문제, 강의', dev: 'EDUWILL', group: '기출 문제풀이', dlNum: 500000, dl: '50만+', score: '3.95', n: 4262, updated: '2026-10-15', memo: '강의 중심이라 직접 비교는 어려워요' },
    { id: 'kr.co.trutory.nationaltest.publicservice9', name: '9급 공무원 시험 기출문제', dev: 'Trutory', group: '기출 문제풀이', dlNum: 100000, dl: '10만+', score: '3.8', n: 826, updated: '2026-09-07', memo: '2007~2026 기출 약 4만 문항·해설 약 1만 3천 개' },
    { id: 'com.jlesoft.civilservice.koreanhistoryexam9', name: '런투런 학습앱(공무원 준비생 학습어플)', dev: 'ezBrainsoft', group: '기출 문제풀이', dlNum: 100000, dl: '10만+', score: '4.0', n: 1599, updated: '2026-07-31', memo: '이름(패키지)에 한국사가 들어 있어요. 영어가 있는지는 확인 필요' },
    { id: 'com.jisoopaullee.gongmuwon', name: '공무원 영어 단어장, 공무원영단어 어플 -영단어는관리다', dev: 'Damascus Apps', group: '공무원 영어 어휘', dlNum: 10000, dl: '1만+', score: '4.6', n: 1064, updated: '2022-05-05', memo: '공무원 영단어 직접 경쟁. 업데이트는 멈췄지만 평점 수가 많아요' },
    { id: 'com.examscreen.english9', name: '틈틈영어 -9급 (기출문제+해설, 공무원 잠금화면공부)', dev: '틈틈봇', group: '공무원 영어 어휘', dlNum: 10000, dl: '1만+', score: '4.2', n: 92, updated: '2021-06-01', memo: '잠금화면 방식. 마지막 업데이트가 오래됐어요' },
    { id: 'com.tmtmapp.official', name: '틈틈봇-공무원시험대비 (9급 OX문제, 기출유형)+알람', dev: '틈틈봇', group: '공무원 영어 어휘', dlNum: 10000, dl: '1만+', score: '4.1', n: 227, updated: '2026-10-12', memo: '같은 개발사의 공무원 전과목 잠금화면·알람 앱. 영어 비중은 확인 필요' },
    { id: 'com.stn.gongpul', name: '공풀 - 공무원 기출문제풀이', dev: 'ST Unitas', group: '기출 문제풀이', dlNum: 10000, dl: '1만+', score: '3.4', n: 357, updated: '2026-09-15', memo: '공단기(에스티유니타)의 기출 풀이 앱' },
    { id: 'com.promokings.promoking', name: '합격왕: 공무원·경찰·공인중개사·변시 기출', dev: '이스터브랩', group: '기출 문제풀이', dlNum: 10000, dl: '1만+', score: '4.9', n: 123, updated: '2026-10-16', memo: '지문 단위 반복학습·데일리 5제' },
    { id: 'dev.itpeoplewon.publicofficial9engvoca', name: '9급 공무원 시험 대비 영단어 - 필수 영단어 카드', dev: '간큰토끼', group: '공무원 영어 어휘', dlNum: 1000, dl: '1천+', score: '3.4', n: 5, updated: '2026-04-02', memo: '평점이 5개뿐이라 표본이 작아요' },
    { id: 'kr.co.eduspace.vocaeng', name: '외워보카 영어 - 토익·토플·텝스·공무원 영어 단어장', dev: 'eduspace', group: '공무원 영어 어휘', dlNum: 1000, dl: '1천+', score: '4.75', n: 16, updated: '2026-10-12', memo: '토익·토플·텝스·공무원을 한 앱에 묶었어요' },
    { id: 'com.jmiro.korea.phone.officead', name: '공무원 영어단어 - 재미로 영어', dev: 'plantymobile', group: '공무원 영어 어휘', dlNum: 100, dl: '100+', score: '', n: 0, updated: '2026-08-14', memo: '끝말잇기·크로스워드 방식. 규모가 매우 작아요' }
  ]
};
