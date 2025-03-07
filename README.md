# overjjangDiscordBot
버짱버짱 디코봇
# 기본사항
이 봇은 node.js + discord.js 기반으로 실행되는 디스코드 편의성 봇입니다.<br>
종속성은`npm install` 으로 설치할 수 있습니다
# 사용법
기본적으로 `node index.js`로 실행 할 수 있습니다. <br>
실행 후 자동으로 명령어가 배포됩니다.<br>
.env 파일에는
TOKEN, GUILD_ID, CLIENT_ID 가 들어가야 합니다.<br>
토큰값은 <a href="https://discord.com/developers/applications">디스코드 개발자 포털</a>의 My Applications/Bot에서, 클라이언트 아이디는 General Information에서 볼 수 있습니다.<br>
길드 아이디는 개발 서버의 이름 우클릭-> 서버 ID복사하기로 얻을 수 있습니다
# 명령어
`/도움말`: 명령어 리스트 출력<br>
`/오늘급식 [학교이름]`: NEIS API를 통한 급식 매뉴 출력<br>
`/핑`: 퐁!
`/운송장 조회 [운송회사] [운송장번호]`: 스마트텍베 API를 이용해 운송장번호를 조회합니다.
`/배그 비밀의방 [맵이름]`: 배틀그라운드의 비밀의방 정보를 표시합니다
`/배그 전적 [플렛폼] [플레이어 이름] <모드>`: 베틀그라운드 플레이어의 전적을 조회합니다
# 기타
기타 등등~
