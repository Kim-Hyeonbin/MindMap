// erf 근사식
function erf(x) {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * x);
  const y =
    1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

// Z-score를 백분율로 만드는 근사식
function normalCDF(z) {
  return (1 + erf(z / Math.sqrt(2))) / 2;
}

// 각 요인의 레벨별 코멘트
const levelComments = {
  외향성: {
    낮음: "조용함 속에서 에너지를 회복하며, 선택적으로 관계를 맺는 편입니다.",
    "약간 낮음": "낯선 환경보다 익숙한 사람들과의 교류에서 편안함을 느낍니다.",
    보통: "상황에 따라 내향과 외향을 자연스럽게 오가며 균형 잡힌 소통을 합니다.",
    "약간 높음":
      "적당한 사회적 자극을 즐기며, 새로운 교류에 열린 태도를 보입니다.",
    높음: "사람 속에서 활력을 얻고, 사회적 상호작용을 자연스럽게 주도합니다.",
  },
  "원만성/호감성": {
    낮음: "자기 의견을 우선시하며, 감정적 거리를 유지하는 편입니다.",
    "약간 낮음": "필요할 때는 솔직하고 직설적인 태도로 의사를 표현합니다.",
    보통: "배려와 자기 주장 사이에서 안정적인 균형을 이루려는 성향입니다.",
    "약간 높음":
      "타인의 감정을 자연스럽게 고려하며 조화로운 관계를 선호합니다.",
    높음: "상대의 감정에 깊이 공감하고, 관계의 안정성을 우선시합니다.",
  },
  성실성: {
    낮음: "즉흥성과 유연성이 강해, 계획보다 흐름에 맡기는 방식을 선호합니다.",
    "약간 낮음":
      "규칙보다는 상황을 보고 판단하며, 일의 속도를 중시하는 편입니다.",
    보통: "필요할 때는 체계적으로, 필요 없을 때는 유연하게 접근합니다.",
    "약간 높음":
      "정해진 틀과 일정 속에서 안정감을 느끼고 꾸준히 성과를 냅니다.",
    높음: "계획과 규율을 확실히 지키며, 목표 달성을 위한 자기 관리 능력이 뛰어납니다.",
  },
  "정서적 안정성": {
    낮음: "환경의 변화나 스트레스에 민감하게 반응하는 경향이 있습니다.",
    "약간 낮음":
      "감정 기복이 있을 수 있으나 스스로 균형을 찾기 위해 노력합니다.",
    보통: "대부분의 상황에서 감정적 균형을 적당히 유지합니다.",
    "약간 높음": "스트레스 상황에서도 비교적 안정적으로 대응합니다.",
    높음: "감정 기복이 거의 없으며, 압박 상황에서도 침착함을 유지합니다.",
  },
  "지성/상상력": {
    낮음: "새로운 개념보다 익숙한 방식에 더 편안함을 느끼는 성향입니다.",
    "약간 낮음": "추상적 사고보다 실용적 접근을 조금 더 선호합니다.",
    보통: "현실성과 상상력 사이에서 유연한 사고를 보여줍니다.",
    "약간 높음": "새로운 아이디어와 관점을 기꺼이 받아들이는 경향이 있습니다.",
    높음: "풍부한 상상력과 깊은 탐구심을 바탕으로 사고의 폭이 넓습니다.",
  },
};

window.onload = () => {
  const data = sessionStorage.getItem("factorScores");
  const container = document.getElementById("result-container");

  if (!data) {
    container.innerHTML =
      "<p>검사 결과가 없습니다. 다시 검사를 진행해주세요.</p>";
    return;
  }

  const scores = JSON.parse(data);
  console.log(scores);

  fetch("../assets/ipip_resource.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("통계 데이터를 불러올 수 없습니다.");
      }
      return response.json();
    })
    .then((json) => {
      const status = json.statistics;

      // Z-Score 계산
      const zScores = {
        외향성:
          (scores["외향성"] - status["외향성"].mean) / status["외향성"].sd,
        "원만성/호감성":
          (scores["원만성/호감성"] - status["원만성/호감성"].mean) /
          status["원만성/호감성"].sd,
        성실성:
          (scores["성실성"] - status["성실성"].mean) / status["성실성"].sd,
        "정서적 안정성":
          (scores["정서적 안정성"] - status["정서적 안정성"].mean) /
          status["정서적 안정성"].sd,
        "지성/상상력":
          (scores["지성/상상력"] - status["지성/상상력"].mean) /
          status["지성/상상력"].sd,
      };

      // 각 요인에 대한 간단한 설명
      const factorDescriptions = {
        외향성: "외향성은 사회적 상호작용에서 에너지를 얻는 정도를 나타냅니다.",
        "원만성/호감성":
          "원만성은 타인을 배려하고 조화롭게 관계를 유지하려는 성향을 의미합니다.",
        성실성:
          "성실성은 계획성·책임감·규칙 준수 등 자기 관리 능력을 나타냅니다.",
        "정서적 안정성":
          "정서적 안정성은 스트레스 상황에서도 감정 균형을 유지하는 정도를 의미합니다.",
        "지성/상상력":
          "지성/상상력은 사고의 유연함, 상상력, 지적 호기심을 나타냅니다.",
      };

      for (let key in scores) {
        const stat = status[key];
        if (!stat) continue;

        const div = document.createElement("div");
        div.className = "factor-block";

        // 퍼센타일 계산
        let percentile = normalCDF(zScores[key]) * 100;

        // 레벨 판정
        let level = "";
        if (percentile < 16) level = "낮음";
        else if (percentile < 33) level = "약간 낮음";
        else if (percentile < 66) level = "보통";
        else if (percentile < 83) level = "약간 높음";
        else level = "높음";

        // 레벨 별 코멘트
        let comment = levelComments[key][level];

        // 사용자 점수(1~5 스케일로 정규화 필요)
        const yourScore = scores[key];
        const meanScore = stat.mean;
        const yourPos = (yourScore / 5) * 100;
        const meanPos = (meanScore / 5) * 100;

        // HTML 구성
        div.innerHTML = `
          <div class="factor-title">${key}</div>
          <div class="factor-description">${factorDescriptions[key]}</div>
          <div class="factor-comment">당신은 ${comment}</div>

          <div class="percent-label">
            percentile: ${percentile.toFixed(1)}% — ${level}
          </div>

          <!-- 퍼센타일 progress bar -->
          <div class="bar-wrapper">
            <div class="bar-fill" style="width:${percentile.toFixed(
              1
            )}%;"></div>
          </div>

          <!-- 점수 비교 -->
          <div class="score-line">
            <div class="line"></div>
            <div class="score-dot my-score-dot" style="left:${yourPos}%;"></div>
            <div class="score-dot mean-score-dot" style="left:${meanPos}%;"></div>
          </div>

          <div class="score-labels">
            <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
          </div>

          <p style="margin-top:10px; font-size:14px;">
            내 점수 (푸른 점): ${yourScore.toFixed(2)} / 5<br>
            평균 점수 (어두운 점): ${meanScore.toFixed(2)} / 5
          </p>
        `;

        container.appendChild(div);
      }
    });

  document.getElementById("btn-home").addEventListener("click", () => {
    window.location.href = "../index.html";
  });
};
