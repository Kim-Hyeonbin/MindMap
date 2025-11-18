// 정규분포 CDF (퍼센타일 계산용)
function erf(x) {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1 / (1 + p * x);
  const y =
    1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

function normalCDF(z) {
  return (1 + erf(z / Math.sqrt(2))) / 2;
}

window.onload = () => {
  const data = sessionStorage.getItem("scaleScores");
  const container = document.getElementById("result-container");

  if (!data) {
    container.innerHTML =
      "<p>검사 결과가 없습니다. 다시 검사를 진행해주세요.</p>";
    return;
  }

  const scores = JSON.parse(data);

  // DASS 통계(JSON) 불러오기
  fetch("../assets/dass_resource.json")
    .then((res) => res.json())
    .then((stats) => {
      // DASS 통계 객체은 JSON의 `statistics`에 들어있음
      const s = stats.statistics;

      // Z-score 계산
      const zScores = {
        D: (scores.D - s.D.mean) / s.D.sd,
        A: (scores.A - s.A.mean) / s.A.sd,
        S: (scores.S - s.S.mean) / s.S.sd,
      };

      // 제목 + 설명
      const titles = {
        D: "우울(Depression)",
        A: "불안(Anxiety)",
        S: "스트레스(Stress)",
      };

      const descriptions = {
        D: "우울은 무기력감·슬픔·흥미 상실 등 정서적 저하 상태를 나타냅니다.",
        A: "불안은 위험·위협을 예상하는 심리적 경향과 신체적 흥분 수준을 의미합니다.",
        S: "스트레스는 긴장, 과부하, 압박감에 대한 반응 강도를 나타냅니다.",
      };

      for (let key of ["D", "A", "S"]) {
        const mean = s[key].mean;
        const sd = s[key].sd;
        const raw = scores[key];

        // 퍼센타일
        const percentile = normalCDF(zScores[key]) * 100;

        // 레벨 판정
        let level = "";
        if (percentile < 16) level = "낮음";
        else if (percentile < 33) level = "약간 낮음";
        else if (percentile < 66) level = "보통";
        else if (percentile < 83) level = "약간 높음";
        else level = "높음";

        // UI 생성
        const div = document.createElement("div");
        div.className = "factor-block";

        div.innerHTML = `
          <div class="factor-header">
            <div class="factor-title">${titles[key]}</div>
            <div class="factor-description">${descriptions[key]}</div>
          </div>

          <div class="factor-comment">
            당신의 위치는 <b>${percentile.toFixed(
              1
            )}%</b> — <b>${level}</b> 수준입니다.
          </div>

          <p class="score-info" style="margin-top:10px; font-size:14px;">
            내 점수: ${raw} 점<br>
            집단 평균: ${mean.toFixed(1)} 점
          </p>
        `;

        container.appendChild(div);
      }
    });

  // 홈 버튼
  document.getElementById("btn-home").addEventListener("click", () => {
    window.location.href = "https://kim-hyeonbin.github.io/MindMap/index.html";
  });
};
