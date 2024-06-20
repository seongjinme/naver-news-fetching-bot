/*************************************************************************************************
 * Naver News Fetching Bot: source.gs
 * ***********************************************************************************************
 * 네이버 뉴스가 메신저로 전송될 때 포함되는 매체명 데이터를 이곳에서 편집하실 수 있습니다.
 * 데이터는 반드시 URL 주소 기준으로 오름차순 정렬되어 있어야 하는 점에 유의해주세요.
 *
 * - 마지막 업데이트 : 2022년 8월 24일
 * ***********************************************************************************************/

function listSource() {
  return (list = [
    ["100ssd.co.kr", "백세시대"],
    ["4th.kr", "포쓰저널"],
    ["ablenews.co.kr", "에이블뉴스"],
    ["aflnews.co.kr", "농수축산신문"],
    ["agrinet.co.kr", "한국농어민신문"],
    ["aitimes.co.kr", "AI타임스"],
    ["aitimes.kr", "인공지능신문"],
    ["ajunews.com", "아주경제"],
    ["akomnews.com", "한의신문"],
    ["allurekorea.com", "allure"],
    ["amenews.kr", "신소재경제신문"],
    ["amnews.co.kr", "농축유통신문"],
    ["andongmbc.co.kr", "안동MBC"],
    ["apnews.kr", "AP신문"],
    ["apparelnews.co.kr", "어패럴뉴스"],
    ["apsk.co.kr", "한국스포츠통신"],
    ["aptn.co.kr", "아파트관리신문"],
    ["areyou.co.kr", "아유경제"],
    ["artinsight.co.kr", "아트인사이트"],
    ["asiaarts.net", "아시아에이"],
    ["asiae.co.kr", "아시아경제"],
    ["asiatime.co.kr", "아시아타임즈"],
    ["asiatoday.co.kr", "아시아투데이"],
    ["atstar1.com", "앳스타일"],
    ["audioht.co.kr", "월간 오디오"],
    ["autodaily.co.kr", "오토데일리"],
    ["autotimes.co.kr", "오토타임즈"],
    ["babytimes.co.kr", "베이비타임즈"],
    ["baduk.hangame.com", "한게임 바둑"],
    ["basketkorea.com", "바스켓코리아"],
    ["bbc.co.uk", "BBC"],
    ["bbsfm.co.kr", "BBS NEWS"],
    ["beminor.com", "비마이너"],
    ["beopbo.com", "법보신문"],
    ["besteleven.com", "베스트일레븐"],
    ["betanews.co.kr", "베타뉴스"],
    ["beyondpost.co.kr", "비욘드포스트"],
    ["bigtanews.co.kr", "빅터뉴스"],
    ["biz.chosun.com", "조선비즈"],
    ["biz.sbs.co.kr", "SBS Biz"],
    ["bizenter.co.kr", "비즈엔터"],
    ["bizhankook.com", "비즈한국"],
    ["bizwatch.co.kr", "비즈니스워치"],
    ["bizwnews.com", "비즈월드"],
    ["bloter.net", "블로터"],
    ["bntnews.co.kr", "bnt뉴스"],
    ["boannews.com", "보안뉴스"],
    ["bokuennews.com", "보건뉴스"],
    ["bosa.co.kr", "의학신문"],
    ["brainmedia.co.kr", "브레인미디어"],
    ["bravo.etoday.co.kr", "브라보마이라이프"],
    ["breaknews.com", "브레이크뉴스"],
    ["btnnews.tv", "BTN불교TV"],
    ["busan.com", "부산일보"],
    ["busaneconomy.com", "부산제일경제"],
    ["busanmbc.co.kr", "부산MBC"],
    ["businesskorea.co.kr", "비지니스코리아"],
    ["businessplus.kr", "비즈니스플러스"],
    ["businesspost.co.kr", "비즈니스포스트"],
    ["byline.network", "바이라인네트워크"],
    ["bzeronews.com", "불교공뉴스"],
    ["cancerline.co.kr", "월간암"],
    ["catholicnews.co.kr", "가톨릭뉴스 지금여기"],
    ["catholictimes.org", "가톨릭신문"],
    ["cbci.co.kr", "CBC뉴스"],
    ["ccdailynews.com", "충청일보"],
    ["ccdn.co.kr", "충청매일"],
    ["ccnnews.co.kr", "충청뉴스"],
    ["ccreview.co.kr", "충청리뷰"],
    ["cctimes.kr", "충청타임즈"],
    ["cctoday.co.kr", "충청투데이"],
    ["cctvnews.co.kr", "CCTV뉴스"],
    ["celuvmedia.com", "셀럽미디어"],
    ["ceoscoredaily.com", "CEO스코어데일리"],
    ["cfnews.kr", "유교신문"],
    ["ch.lghellovision.net", "LG헬로비전"],
    ["ch.yes24.com", "채널예스"],
    ["ch1.tbroad.com", "SK브로드밴드"],
    ["chemicalnews.co.kr", "케미컬뉴스"],
    ["chmbc.co.kr", "춘천MBC"],
    ["choicenews.co.kr", "초이스경제"],
    ["chosun.com", "조선일보"],
    ["chtoday.co.kr", "크리스천투데이"],
    ["chungnamilbo.co.kr", "충남일보"],
    ["cine21.com", "씨네21"],
    ["ciokorea.com", "CIO Korea"],
    ["civicnews.com", "시빅뉴스"],
    ["cjb.co.kr", "CJB청주방송"],
    ["cmbdj.co.kr", "CMB대전방송"],
    ["cmbkj.co.kr", "CMB광주방송"],
    ["cnbnews.com", "CNB뉴스"],
    ["cnet.co.kr", "씨넷코리아"],
    ["cnews.co.kr", "e대한경제"],
    ["codingworldnews.com", "코딩월드뉴스"],
    ["coindeskkorea.com", "코인데스크코리아"],
    ["coinreaders.com", "코인리더스"],
    ["constimes.co.kr", "건설타임즈"],
    ["consumernews.co.kr", "소비자가 만드는 신문"],
    ["consumuch.com", "컨슈머치"],
    ["cooknchefnews.com", "쿡앤셰프"],
    ["cstimes.com", "컨슈머타임스"],
    ["cts.tv", "CTS"],
    ["daejonilbo.com", "대전일보"],
    ["dailian.co.kr", "데일리안"],
    ["daily.hankooki.com", "데일리한국"],
    ["dailycar.co.kr", "데일리카"],
    ["dailyimpact.co.kr", "데일리임팩트"],
    ["dailymedi.com", "데일리메디"],
    ["dailynk.com", "데일리NK"],
    ["dailypharm.com", "데일리팜"],
    ["dailypop.kr", "데일리팝"],
    ["dailysecu.com", "데일리시큐"],
    ["dailysmart.co.kr", "스마트경제"],
    ["dailysportshankook.co.kr", "데일리스포츠한국"],
    ["dailytw.kr", "데일리투머로우"],
    ["dailyvet.co.kr", "데일리벳"],
    ["danbinews.com", "단비뉴스"],
    ["dandinews.com", "단디뉴스"],
    ["datanet.co.kr", "데이터넷"],
    ["datanews.co.kr", "데이터뉴스"],
    ["datasom.co.kr", "데이터솜"],
    ["ddaily.co.kr", "디지털데일리"],
    ["ddanzi.com", "딴지일보"],
    ["decenter.kr", "디센터"],
    ["delighti.co.kr", "딜라이트닷넷"],
    ["dentalnews.or.kr", "치과신문"],
    ["dgmbc.com", "대구MBC"],
    ["dhnews.co.kr", "대학저널"],
    ["digitaltoday.co.kr", "디지털투데이"],
    ["dispatch.co.kr", "디스패치"],
    ["ditoday.com", "디아이투데이"],
    ["dizzotv.com", "디지틀조선TV"],
    ["dkilbo.com", "대경일보"],
    ["dnews.co.kr", "e대한경제"],
    ["docdocdoc.co.kr", "청년의사"],
    ["doctorstimes.com", "의사신문"],
    ["domin.co.kr", "전북도민일보"],
    ["donga.com", "동아일보"],
    ["donga.com/docs/magazine/weekly", "주간동아"],
    ["dongascience.com", "동아사이언스"],
    ["dongponews.net", "재외동포신문"],
    ["dream.kotra.or.kr/kotranews", "KOTRA해외시장뉴스"],
    ["dt.co.kr", "디지털타임스"],
    ["dtnews24.com", "디트뉴스24"],
    ["dynews.co.kr", "동양일보"],
    ["e-platform.net", "에너지플랫폼뉴스"],
    ["e2news.com", "이투뉴스"],
    ["earlyadopter.co.kr", "얼리어답터"],
    ["ebn.co.kr", "EBN"],
    ["ebs.co.kr", "EBS"],
    ["ebuzz.co.kr", "넥스트데일리"],
    ["economist.co.kr", "이코노미스트"],
    ["economychosun.com", "이코노미조선"],
    ["economytalk.kr", "이코노미톡뉴스"],
    ["econonews.co.kr", "이코노뉴스"],
    ["econotelling.com", "이코노텔링"],
    ["econovill.com", "이코노믹리뷰"],
    ["edaily.co.kr", "이데일리"],
    ["edu.chosun.com", "조선에듀"],
    ["edu.donga.com", "에듀동아"],
    ["edupress.kr", "에듀프레스"],
    ["efnews.co.kr", "파이낸셜신문"],
    ["einfomax.com", "연합인포맥스"],
    ["ekn.kr", "에너지경제"],
    ["electimes.com", "전기신문"],
    ["elle.co.kr", "엘르"],
    ["en.yna.co.kr", "EPA연합뉴스"],
    ["energydaily.co.kr", "에너지데일리"],
    ["enetnews.co.kr", "이넷뉴스"],
    ["enews.imbc.com", "MBC연예"],
    ["enewstoday.co.kr", "이뉴스투데이"],
    ["engdaily.com", "엔지니어링데일리"],
    ["ent.sbs.co.kr", "SBS연예뉴스"],
    ["epj.co.kr", "일렉트릭파워"],
    ["epnc.co.kr", "테크월드"],
    ["eroun.net", "이로운넷"],
    ["esports.dailygame.co.kr", "데일리e스포츠"],
    ["esquirekorea.co.kr", "에스콰이어"],
    ["etnews.com", "전자신문"],
    ["etoday.co.kr", "이투데이"],
    ["etomato.com", "뉴스토마토"],
    ["ezyeconomy.com", "이지경제"],
    ["farminsight.net", "농장에서식탁까지"],
    ["farmnmarket.com", "팜앤마켓매거진"],
    ["fashionbiz.co.kr", "패션비즈"],
    ["fashionn.com", "패션엔"],
    ["finomy.com", "현대경제신문"],
    ["fins.co.kr", "보험매일"],
    ["fintechpost.co.kr", "블록체인밸리"],
    ["fish.darakwon.co.kr", "낚시춘추"],
    ["fnnews.com", "파이낸셜뉴스"],
    ["fntimes.com", "한국금융신문"],
    ["fomos.kr", "포모스"],
    ["foodneconomy.com", "푸드경제신문 organiclife"],
    ["foodnews.co.kr", "식품저널 foodnews"],
    ["foodtvnews.com", "FETV"],
    ["footballist.co.kr", "풋볼리스트"],
    ["fortunekorea.co.kr", "포춘코리아"],
    ["fourfourtwo.co.kr", "포포투"],
    ["fpn119.co.kr", "FPN"],
    ["fsnews.co.kr", "대한급식신문"],
    ["ftimes.kr", "FT스포츠"],
    ["ftoday.co.kr", "파이낸셜투데이"],
    ["futurechosun.com", "더나은미래"],
    ["g-enews.com", "글로벌이코노믹"],
    ["g1tv.co.kr", "G1방송"],
    ["game.donga.com", "게임동아"],
    ["gamechosun.co.kr", "게임조선"],
    ["gamefocus.co.kr", "게임포커스"],
    ["gamemeca.com", "게임메카"],
    ["gameple.co.kr", "게임플"],
    ["gameshot.net", "게임샷"],
    ["gametoc.co.kr", "게임톡"],
    ["gamevu.co.kr", "게임뷰"],
    ["gasnews.com", "가스신문"],
    ["getnews.co.kr", "글로벌경제"],
    ["ggilbo.com", "금강일보"],
    ["gimhaenews.co.kr", "김해뉴스"],
    ["gjdream.com", "광주드림"],
    ["globale.co.kr", "글로벌E"],
    ["globaledunews.co.kr", "글로벌에픽"],
    ["gndomin.com", "경남도민신문"],
    ["gnmaeil.com", "경남매일신문"],
    ["gnnews.co.kr", "경남일보"],
    ["goal.com", "골닷컴"],
    ["gobalnews.com", "고발뉴스"],
    ["gocj.net", "대전시티저널"],
    ["gokorea.kr", "공감신문"],
    ["golfdigest.co.kr", "골프다이제스트"],
    ["golfguide.co.kr", "지이코노미"],
    ["golfhankook.com", "골프한국"],
    ["golfjournal.co.kr", "골프저널"],
    ["goodkyung.com", "굿모닝경제"],
    ["goodmorningcc.com", "굿모닝충청"],
    ["goodnews1.com", "데일리굿뉴스"],
    ["gosiweek.com", "공무원수험신문"],
    ["gpkorea.com", "지피코리아"],
    ["gqkorea.co.kr", "GQ"],
    ["greendaily.co.kr", "그린데일리"],
    ["greenpostkorea.co.kr", "그린포스트코리아"],
    ["gukjenews.com", "국제뉴스"],
    ["gvalley.co.kr", "G밸리뉴스"],
    ["h21.hani.co.kr", "한겨레21"],
    ["hani.co.kr", "한겨레"],
    ["hankookilbo.com", "한국일보"],
    ["hankyung.com", "한국경제"],
    ["hapt.co.kr", "한국아파트신문"],
    ["harpersbazaar.co.kr", "하퍼스바자"],
    ["headlinejeju.co.kr", "헤드라인제주"],
    ["health.chosun.com", "헬스조선"],
    ["healthinnews.co.kr", "헬스인뉴스"],
    ["hellodd.com", "헬로디디"],
    ["hellot.net", "헬로티"],
    ["heraldbiz.com", "헤럴드경제"],
    ["heraldpop.com", "헤럴드POP"],
    ["hg-times.com", "한강타임즈"],
    ["hidoc.co.kr", "하이닥"],
    ["hidomin.com", "경북도민일보"],
    ["hobbyissue.co.kr", "하비엔"],
    ["hortitimes.com", "월간원예"],
    ["housingherald.co.kr", "하우징헤럴드"],
    ["huffingtonpost.kr", "허프포스트코리아"],
    ["hyunbulnews.com", "현대불교신문"],
    ["ibabynews.com", "베이비뉴스"],
    ["ibuan.com", "부안독립신문"],
    ["ibulgyo.com", "불교신문"],
    ["ichannela.com", "채널A"],
    ["idaegu.co.kr", "대구신문"],
    ["idaegu.com", "대구일보"],
    ["idjnews.kr", "당진신문"],
    ["idomin.com", "경남도민일보"],
    ["ifm.kr", "경인방송"],
    ["ifs.or.kr", "국가미래연구원"],
    ["ikbc.co.kr", "kbc광주방송"],
    ["ikld.kr", "국토일보"],
    ["ikoreanspirit.com", "K스피릿"],
    ["ilemonde.com", "르몽드"],
    ["ilovepc.co.kr", "PC사랑"],
    ["ilyo.co.kr", "일요신문"],
    ["ilyosisa.co.kr", "일요시사"],
    ["imaeil.com", "매일신문"],
    ["iminju.net", "민주신문"],
    ["imnews.imbc.com", "MBC"],
    ["imwood.co.kr", "나무신문"],
    ["incheonin.com", "인천in"],
    ["incheonnews.com", "인천뉴스"],
    ["industrynews.co.kr", "인더스트리뉴스"],
    ["inews24.com", "아이뉴스24"],
    ["inews365.com", "충북일보"],
    ["insidevina.com", "인사이드 비나"],
    ["insight.co.kr", "인사이트"],
    ["insightkorea.co.kr", "인사이트코리아"],
    ["insnews.co.kr", "한국보험신문"],
    ["interfootball.co.kr", "인터풋볼"],
    ["interview365.com", "인터뷰365"],
    ["inthenews.co.kr", "인더뉴스"],
    ["intn.co.kr", "일간NTN"],
    ["inven.co.kr", "인벤"],
    ["investchosun.com", "인베스트조선"],
    ["irobotnews.com", "로봇신문"],
    ["isisa.net", "인천투데이"],
    ["isplus.joins.com", "일간스포츠"],
    ["issuenbiz.com", "이슈앤비즈"],
    ["it-b.co.kr", "아이티비즈"],
    ["it.chosun.com", "IT조선"],
    ["it.donga.com", "IT동아"],
    ["itbiznews.com", "IT비즈뉴스"],
    ["itdaily.kr", "아이티데일리"],
    ["itimes.co.kr", "인천일보"],
    ["itooza.com", "아이투자"],
    ["itworld.co.kr", "ITWorld"],
    ["iusm.co.kr", "울산매일신문"],
    ["ize.co.kr", "아이즈 ize"],
    ["jbnews.com", "중부매일"],
    ["jejudomin.co.kr", "제주도민일보"],
    ["jejuilbo.net", "뉴제주일보"],
    ["jejumaeil.net", "제주매일"],
    ["jejumbc.com", "제주MBC"],
    ["jejusori.net", "제주의소리"],
    ["jejutwn.com", "제주교통복지신문"],
    ["jemin.com", "제민일보"],
    ["jeollailbo.com", "전라일보"],
    ["jeonmae.co.kr", "전국매일신문"],
    ["jeonmin.co.kr", "전민일보"],
    ["jgolfi.joins.com", "JTBC GOLF"],
    ["jhealthmedia.joins.com", "중앙일보 헬스미디어"],
    ["jibs.co.kr", "JIBS"],
    ["jjan.kr", "전북일보"],
    ["jjn.co.kr", "전북중앙"],
    ["jmagazine.joins.com/economist?cloc=joongang-home-jmnet", "이코노미스트"],
    ["jmagazine.joins.com/forbes", "포브스코리아"],
    ["jmagazine.joins.com/monthly", "월간중앙"],
    ["jmbc.co.kr", "전주MBC"],
    ["jndn.com", "전남매일"],
    ["jnilbo.com", "전남일보"],
    ["job-post.co.kr", "잡포스트"],
    ["jobnjoy.com", "한경잡앤조이"],
    ["joongang.co.kr", "중앙일보"],
    ["joongang.tv", "중앙신문"],
    ["joongboo.com", "중부일보"],
    ["joongdo.co.kr", "중도일보"],
    ["joseilbo.com", "조세일보"],
    ["journal.kobeta.com", "방송기술저널"],
    ["journalist.or.kr", "기자협회보"],
    ["joygm.com", "광명지역신문"],
    ["joynews24.com", "조이뉴스24"],
    ["jtbc.joins.com", "JTBC"],
    ["jtv.co.kr", "JTV전주방송"],
    ["jumpball.co.kr", "점프볼"],
    ["junggi.co.kr", "중기이코노미"],
    ["k-health.com", "헬스경향"],
    ["kado.net", "강원도민일보"],
    ["kbanker.co.kr", "대한금융신문"],
    ["kbench.com", "케이벤치"],
    ["kbiznews.co.kr", "중소기업뉴스"],
    ["kbmaeil.com", "경북매일신문"],
    ["kbs.co.kr", "KBS"],
    ["kbsm.net", "경북신문"],
    ["kdfnews.com", "한국면세뉴스"],
    ["kdpress.co.kr", "데일리경제"],
    ["kenews.co.kr", "한국농촌경제신문"],
    ["kgnews.co.kr", "경기신문"],
    ["khan.co.kr", "경향신문"],
    ["khgames.co.kr", "경향게임스"],
    ["kidd.co.kr", "산업일보"],
    ["kids.donga.com", "어린이동아"],
    ["kidshankook.kr", "소년한국일보"],
    ["kihoilbo.co.kr", "기호일보"],
    ["kizmom.hankyung.com", "키즈맘"],
    ["kjdaily.com", "광주매일신문"],
    ["kjmbc.co.kr", "광주MBC"],
    ["klnews.co.kr", "물류신문"],
    ["kmaeil.com", "경인매일"],
    ["kmatimes.com", "의협신문"],
    ["kmedinfo.co.kr", "e의료정보"],
    ["kmib.co.kr", "국민일보"],
    ["knn.co.kr", "KNN"],
    ["knnews.co.kr", "경남신문"],
    ["knpnews.com", "한국원자력신문"],
    ["kntimes.co.kr", "이코리아"],
    ["koit.co.kr", "정보통신신문"],
    ["konas.net", "코나스"],
    ["kookbang.dema.mil.kr", "국방일보"],
    ["kookje.co.kr", "국제신문"],
    ["kor.theasian.asia", "아시아엔"],
    ["koreadaily.com", "미주중앙일보"],
    ["koreaittimes.com", "Korea IT Times"],
    ["koreajoongangdaily.joins.com", "코리아중앙데일리"],
    ["koreanbar.or.kr", "법조신문"],
    ["koreastocknews.com", "증권경제신문"],
    ["koreatimes.com", "미주한국일보"],
    ["kormedi.com", "코메디닷컴"],
    ["kpanews.co.kr", "약사공론"],
    ["kpenews.com", "한국정경신문"],
    ["kpinews.co.kr", "굿모닝경제"],
    ["kr.aving.net", "에이빙뉴스"],
    ["kr.people.com.cn", "인민망"],
    ["ksg.co.kr", "코리아쉬핑가제트"],
    ["ksilbo.co.kr", "경상일보"],
    ["ksmnews.co.kr", "경상매일신문"],
    ["kstar.kbs.co.kr", "KBS 연예"],
    ["ktnews.com", "한국섬유신문"],
    ["ktv.go.kr", "KTV국민방송"],
    ["kukinews.com", "쿠키뉴스"],
    ["kunkang.co.kr", "건강다이제스트"],
    ["kwangju.co.kr", "광주일보"],
    ["kwnews.co.kr", "강원일보"],
    ["kyeonggi.com", "경기일보"],
    ["kyeongin.com", "경인일보"],
    ["kyongbuk.co.kr", "경북일보"],
    ["kyosu.net", "교수신문"],
    ["laborplus.co.kr", "참여와혁신"],
    ["labortoday.co.kr", "매일노동뉴스"],
    ["lady.khan.co.kr", "레이디경향"],
    ["lak.co.kr", "환경과조경"],
    ["lawissue.co.kr", "로이슈"],
    ["lawleader.co.kr", "로리더"],
    ["lawtalknews.co.kr", "로톡뉴스"],
    ["lawtimes.co.kr", "법률신문"],
    ["lcnews.co.kr", "라이센스뉴스"],
    ["lecturernews.com", "한국강사신문"],
    ["legaltimes.co.kr", "리걸타임즈"],
    ["livesnews.com", "라이브팜뉴스"],
    ["lkp.news", "리버티코리아포스트"],
    ["ltn.kr", "법률방송뉴스"],
    ["m-economynews.com", "M이코노미"],
    ["m-i.kr", "매일일보"],
    ["maeilnews.co.kr", "더구루"],
    ["magazine.hankyung.com", "한경비즈니스"],
    ["magazine.hankyung.com/job-joy", "한경잡앤조이"],
    ["magazine.hankyung.com/money", "머니"],
    ["maniareport.com", "마니아타임즈"],
    ["marieclairekorea.com", "마리끌레르"],
    ["mbccb.co.kr", "MBC충북"],
    ["mbceg.co.kr", "MBC강원영동"],
    ["mbcgn.kr", "MBC경남"],
    ["mbn.co.kr", "MBN"],
    ["mbnmoney.mbn.co.kr", "매일경제TV"],
    ["mdilbo.com", "무등일보"],
    ["mdtoday.co.kr", "메디컬투데이"],
    ["meconomynews.com", "시장경제신문"],
    ["mediafine.co.kr", "미디어파인"],
    ["mediagunpo.co.kr", "군포시민신문"],
    ["mediajeju.com", "미디어제주"],
    ["mediapen.com", "미디어펜"],
    ["mediatoday.co.kr", "미디어오늘"],
    ["mediaus.co.kr", "미디어스"],
    ["medical-tribune.co.kr", "메디칼트리뷴"],
    ["medicaltimes.com", "메디칼타임즈"],
    ["medicalworldnews.co.kr", "메디컬월드뉴스"],
    ["medigatenews.com", "메디게이트뉴스"],
    ["medipana.com", "메디파나뉴스"],
    ["medisobizanews.com", "메디소비자뉴스"],
    ["megaeconomy.co.kr", "메가경제"],
    ["metroseoul.co.kr", "메트로신문"],
    ["mhj21.com", "문화저널21"],
    ["mhnse.com", "MHN스포츠"],
    ["mjmedi.com", "민족의학신문"],
    ["mk.co.kr", "매일경제"],
    ["mkeconomy.com", "매경이코노미"],
    ["mkhealth.co.kr", "매경헬스"],
    ["monews.co.kr", "메디칼업저버"],
    ["moneys.mt.co.kr", "머니S"],
    ["monthly.chosun.com", "월간조선"],
    ["mookas.com", "무카스"],
    ["motortrendkorea.com", "모터트렌드 코리아"],
    ["movist.com", "무비스트"],
    ["mpmbc.co.kr", "목포MBC"],
    ["mstoday.co.kr", "MS투데이"],
    ["mt.co.kr", "머니투데이"],
    ["mtn.co.kr", "MTN"],
    ["mtn.mt.co.kr", "MTN"],
    ["mtnews.net", "기계신문"],
    ["munhaknews.com", "문학뉴스"],
    ["munhwa.com", "문화일보"],
    ["munhwanews.com", "문화뉴스"],
    ["mydaily.co.kr", "마이데일리"],
    ["mygoyang.com", "고양신문"],
    ["naeil.com", "내일신문"],
    ["namdonews.com", "남도일보"],
    ["nbntv.co.kr", "내외경제tv"],
    ["netongs.com", "여수넷통뉴스"],
    ["newdaily.co.kr", "뉴데일리"],
    ["news1.kr", "뉴스1"],
    ["news2day.co.kr", "뉴스투데이"],
    ["newsam.co.kr", "농기자재신문"],
    ["newsbrite.net", "뉴스브라이트"],
    ["newscape.co.kr", "뉴스케이프"],
    ["newscj.com", "천지일보"],
    ["newsclaim.co.kr", "뉴스클레임"],
    ["newsculture.press", "뉴스컬처"],
    ["newsen.com", "뉴스엔"],
    ["newsfarm.co.kr", "한국농업신문"],
    ["newsfc.co.kr", "금융소비자뉴스"],
    ["newsfreezone.co.kr", "뉴스프리존"],
    ["newsgn.com", "뉴스경남"],
    ["newshankuk.com", "뉴스한국"],
    ["newsian.co.kr", "뉴시안"],
    ["newsinside.kr", "뉴스인사이드"],
    ["newsis.com", "뉴시스"],
    ["newsjeju.net", "뉴스제주"],
    ["newskr.kr", "한국농어촌방송"],
    ["newslock.co.kr", "뉴스락"],
    ["newsmin.co.kr", "뉴스민"],
    ["newsmp.com", "의약뉴스"],
    ["newsnjoy.or.kr", "뉴스앤조이"],
    ["newspenguin.com", "뉴스펭귄"],
    ["newspim.com", "뉴스핌"],
    ["newspost.kr", "뉴스포스트"],
    ["newsprime.co.kr", "프라임경제"],
    ["newsquest.co.kr", "뉴스퀘스트"],
    ["newstnt.com", "뉴스티앤티"],
    ["newstomato.com", "뉴스토마토"],
    ["newswatch.kr", "뉴스워치"],
    ["newsway.kr", "뉴스웨이"],
    ["newswhoplus.com", "뉴스후플러스"],
    ["newsworker.co.kr", "뉴스워커"],
    ["newsworks.co.kr", "뉴스웍스"],
    ["ngetnews.com", "뉴스저널리즘"],
    ["niceeconomy.co.kr", "나이스경제"],
    ["nocutnews.co.kr", "노컷뉴스"],
    ["nongmin.com", "농민신문"],
    ["nongup.net", "농업정보신문"],
    ["notepet.co.kr", "노트펫"],
    ["nspna.com", "NSP통신"],
    ["ntoday.co.kr", "투데이신문"],
    ["obs.co.kr", "OBS"],
    ["obsnews.co.kr", "OBS TV"],
    ["ohmynews.com", "오마이뉴스"],
    ["okfashion.co.kr", "패션저널"],
    ["onews.tv", "열린뉴스통신"],
    ["opinionnews.co.kr", "오피니언뉴스"],
    ["opiniontimes.co.kr", "오피니언타임스"],
    ["osen.co.kr", "OSEN"],
    ["outdoornews.co.kr", "아웃도어뉴스"],
    ["outsourcing.co.kr", "아웃소싱타임스"],
    ["paxetv.com", "팍스경제TV"],
    ["paxnetnews.com", "팍스넷뉴스"],
    ["pckworld.com", "한국기독공보"],
    ["pdjournal.com", "PD저널"],
    ["pennmike.com", "펜앤드마이크"],
    ["peoplesafe.kr", "매일안전신문"],
    ["pharmnews.com", "팜뉴스"],
    ["phmbc.co.kr", "포항MBC"],
    ["pinpointnews.co.kr", "핀포인트뉴스"],
    ["platum.kr", "플래텀"],
    ["ppss.kr", "ㅍㅍㅅㅅ"],
    ["press9.kr", "프레스나인"],
    ["pressian.com", "프레시안"],
    ["pressm.kr", "프레스맨"],
    ["psnews.co.kr", "퍼블릭뉴스"],
    ["psychiatricnews.net", "정신의학신문"],
    ["queen.co.kr", "Queen"],
    ["radiokorea.com", "라디오코리아"],
    ["rank5.kr", "RANK5"],
    ["rapportian.com", "라포르시안"],
    ["rcast.co.kr", "리얼캐스트"],
    ["readersnews.com", "독서신문"],
    ["realfoods.heraldcorp.com", "리얼푸드"],
    ["realty.chosun.com", "땅집고"],
    ["redian.org", "레디앙"],
    ["robotzine.co.kr", "월간로봇기술"],
    ["rookie.co.kr", "루키"],
    ["rpm9.com", "RPM9"],
    ["s-journal.co.kr", "S-저널"],
    ["safetimes.co.kr", "세이프타임즈"],
    ["safetynews.co.kr", "안전신문"],
    ["sbs.co.kr", "SBS"],
    ["sctoday.co.kr", "서울문화투데이"],
    ["sedaily.com", "서울경제"],
    ["segye.com", "세계일보"],
    ["segyefn.com", "세계비즈"],
    ["sejungilbo.com", "세정일보"],
    ["sentv.co.kr", "서울경제TV"],
    ["seoul.co.kr", "서울신문"],
    ["seouleconews.com", "서울이코노미뉴스"],
    ["seoulfn.com", "서울파이낸스"],
    ["seoulwire.com", "서울와이어"],
    ["shinailbo.co.kr", "신아일보"],
    ["shindonga.donga.com", "신동아"],
    ["siminilbo.co.kr", "시민일보"],
    ["siminsori.com", "시민의소리"],
    ["sisa-news.com", "시사뉴스"],
    ["sisacast.kr", "시사캐스트"],
    ["sisafocus.co.kr", "시사포커스"],
    ["sisain.co.kr", "시사IN"],
    ["sisajournal-e.com", "시사저널이코노미"],
    ["sisajournal.com", "시사저널"],
    ["sisamagazine.co.kr", "시사매거진"],
    ["sisanews24.co.kr", "시사뉴스24"],
    ["sisaon.co.kr", "시사오늘"],
    ["sisaweek.com", "시사위크"],
    ["sisunnews.co.kr", "시선뉴스"],
    ["sjbnews.com", "새전북신문"],
    ["sjsori.com", "세종의 소리"],
    ["skyedaily.com", "스카이데일리"],
    ["slist.kr", "싱글리스트"],
    ["slownews.kr", "슬로우뉴스"],
    ["smartcitytoday.co.kr", "스마트시티투데이"],
    ["smartfn.co.kr", "스마트에프엔"],
    ["smedaily.co.kr", "중소기업신문"],
    ["snmnews.com", "철강금속신문"],
    ["socialvalue.kr", "소셜밸류"],
    ["sommeliertimes.com", "소믈리에타임즈"],
    ["spochoo.com", "스포츠춘추"],
    ["sporbiz.co.kr", "한스경제"],
    ["sportalkorea.com", "스포탈코리아"],
    ["sports.chosun.com", "스포츠조선"],
    ["sports.donga.com", "스포츠동아"],
    ["sports.hankooki.com", "스포츠한국"],
    ["sports.khan.co.kr", "스포츠경향"],
    ["sports.mk.co.kr", "MK스포츠"],
    ["sportsq.co.kr", "스포츠Q"],
    ["sportsseoul.com", "스포츠서울"],
    ["sportsw.kr", "스포츠W"],
    ["sportsworldi.com", "스포츠월드"],
    ["spotvnews.co.kr", "스포티비뉴스"],
    ["srn.hcn.co.kr", "HCN 새로넷방송"],
    ["srtimes.kr", "SR타임스"],
    ["star.moneytoday.co.kr", "스타뉴스"],
    ["stardailynews.co.kr", "스타데일리뉴스"],
    ["starnewsk.com", "K STAR"],
    ["startuptoday.co.kr", "오늘경제"],
    ["stnsports.co.kr", "STN 스포츠"],
    ["stoo.asiae.co.kr", "스포츠투데이"],
    ["straightnews.co.kr", "스트레이트뉴스"],
    ["suhyupnews.co.kr", "어업IN수산"],
    ["sunday.joins.com", "중앙SUNDAY"],
    ["taxtimes.co.kr", "세정신문"],
    ["tbc.co.kr", "TBC대구방송"],
    ["tbs.seoul.kr", "TBS"],
    ["techholic.co.kr", "테크홀릭"],
    ["techm.kr", "테크M"],
    ["technoa.co.kr", "테크노아"],
    ["tenasia.co.kr", "텐아시아"],
    ["tennis.co.kr", "테니스코리아"],
    ["tennispeople.kr", "테니스피플"],
    ["tf.co.kr", "더팩트"],
    ["tfnews.co.kr", "조세금융신문"],
    ["the-pr.co.kr", "더피알"],
    ["thebell.co.kr", "더벨"],
    ["thebigdata.co.kr", "빅데이터뉴스"],
    ["thebilliards.kr", "빌리어즈"],
    ["thedailypost.kr", "데일리포스트"],
    ["thedrive.co.kr", "더드라이브"],
    ["thefirstmedia.net", "더퍼스트"],
    ["thegames.co.kr", "더게임스데일리"],
    ["thegolftimes.co.kr", "골프타임즈"],
    ["thekpm.com", "농업경제신문"],
    ["thepingpong.co.kr", "더핑퐁"],
    ["thepowernews.co.kr", "더파워"],
    ["thepublic.kr", "더퍼블릭"],
    ["thereport.co.kr", "더리포트"],
    ["thescoop.co.kr", "더스쿠프"],
    ["thespike.co.kr", "더 스파이크"],
    ["thesportsasia.com", "몬스터짐"],
    ["thesportstimes.co.kr", "스포츠타임스"],
    ["thevaluenews.co.kr", "더밸류뉴스"],
    ["theviewers.co.kr", "뷰어스"],
    ["thisisgame.com", "디스이즈게임"],
    ["tjb.co.kr", "TJB 대전방송"],
    ["tjmbc.co.kr", "대전MBC"],
    ["todayenergy.kr", "투데이에너지"],
    ["todaykorea.co.kr", "투데이코리아"],
    ["tongilnews.com", "통일뉴스"],
    ["tongplus.com", "디지틀조선일보"],
    ["topclass.chosun.com", "톱클래스"],
    ["topstarnews.net", "톱스타뉴스"],
    ["tournews21.com", "투어코리아뉴스"],
    ["tourtimes.net", "디스커버리뉴스"],
    ["travelitoday.com", "트래블투데이"],
    ["traveltimes.co.kr", "여행신문"],
    ["ttlnews.com", "티티엘뉴스"],
    ["tv.chosun.com", "TV조선"],
    ["tvdaily.co.kr", "티브이데일리"],
    ["tvreport.co.kr", "TV리포트"],
    ["ujeil.com", "울산제일일보"],
    ["unn.net", "한국대학신문"],
    ["updownnews.co.kr", "업다운뉴스"],
    ["upinews.kr", "UPI뉴스"],
    ["usmbc.co.kr", "울산MBC"],
    ["venturesquare.net", "벤처스퀘어"],
    ["veritas-a.com", "베리타스알파"],
    ["viewsnnews.com", "뷰스앤뉴스"],
    ["viva100.com", "브릿지경제"],
    ["vmspace.com", "SPACE(공간)"],
    ["voanews.com", "VOA"],
    ["vogue.co.kr", "VOGUE"],
    ["vop.co.kr", "민중의소리"],
    ["web.pbc.co.kr", "가톨릭평화방송·평화신문"],
    ["web.ubc.co.kr", "ubc울산방송"],
    ["weekly.chosun.com", "주간조선"],
    ["weekly.cnbnews.com", "CNB저널"],
    ["weekly.hankooki.com", "주간한국"],
    ["weekly.khan.co.kr", "주간경향"],
    ["weeklytoday.com", "위클리오늘"],
    ["weeklytrade.co.kr", "한국무역신문"],
    ["welfarenews.net", "장애인신문"],
    ["wemakenews.co.kr", "위메이크뉴스"],
    ["wflower.info", "우먼스플라워"],
    ["whitepaper.co.kr", "화이트페이퍼"],
    ["whosaeng.com", "후생신보"],
    ["wikileaks-kr.org", "위키리크스한국"],
    ["wikitree.co.kr", "위키트리"],
    ["withinnews.co.kr", "위드인뉴스"],
    ["wkorea.com", "더블유코리아"],
    ["wolyo.co.kr", "월요신문"],
    ["woman.chosun.com", "여성조선"],
    ["woman.donga.com", "여성동아"],
    ["womaneconomy.co.kr", "여성경제신문"],
    ["womennews.co.kr", "여성신문"],
    ["womentimes.co.kr", "우먼타임스"],
    ["wonyesanup.co.kr", "원예산업신문"],
    ["woodkorea.co.kr", "한국목재신문"],
    ["worklaw.co.kr", "월간노동법률"],
    ["worknworld.kctu.org", "노동과세계"],
    ["worktoday.co.kr", "워크투데이"],
    ["worldkorean.net", "월드코리안신문"],
    ["wowtv.co.kr", "한국경제TV"],
    ["wsobi.com", "여성소비자신문"],
    ["xportsnews.com", "엑스포츠뉴스"],
    ["yakup.com", "약업신문"],
    ["yeongnam.com", "영남일보"],
    ["yna.co.kr", "연합뉴스"],
    ["yna.kr", "연합뉴스"],
    ["yonhapnewstv.co.kr", "연합뉴스TV"],
    ["youngnong.co.kr", "한국영농신문"],
    ["youthdaily.co.kr", "청년일보"],
    ["ypsori.com", "양평시민의소리"],
    ["ysmbc.co.kr", "여수MBC"],
    ["ytn.co.kr", "YTN"],
    ["ytnradio.kr", "YTN라디오"],
    ["ytnscience.co.kr", "YTN사이언스"],
    ["zdnet.co.kr", "ZDNet Korea"],
    ["ziksir.com", "직썰"],
    ["zine.istyle24.com", "스냅"],
  ]);
}
