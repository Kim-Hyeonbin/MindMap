function animateBarValues(chart, targetData, duration = 900) {
  let start = null;

  function step(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);

    // 단일 dataset만 사용하므로 index 0
    chart.data.datasets[0].data = targetData.map((v) => v * p);
    chart.update();

    if (p < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// 백분율 정규화
function erf(x) {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  const a1 = 0.254829592,
    a2 = -0.284496736,
    a3 = 1.421413741;
  const a4 = -1.453152027,
    a5 = 1.061405429,
    p = 0.3275911;

  const t = 1 / (1 + p * x);
  const y =
    1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

function normalCDF(z) {
  return (1 + erf(z / Math.sqrt(2))) / 2;
}

// 조언 템플릿
const advice = {
  D: {
    낮음: "정서 에너지가 안정적인 흐름입니다. 일상에서 작은 즐거움을 더 붙여보세요.",
    "약간 낮음":
      "균형 잡힌 정도의 기분 상태입니다. 흥미로운 일을 조금 늘려보는 것도 좋습니다.",
    보통: "자연스러운 범위의 기복입니다. 부담 없는 활동 하나를 꾸준히 유지해보세요.",
    "약간 높음":
      "무기력감이 찾아올 수 있습니다. 아주 작은 성취부터 쌓아도 충분합니다.",
    높음: "정서 에너지가 낮아진 시기입니다. 짧은 산책이나 햇빛 등 가벼운 자극이 도움이 됩니다.",
  },
  A: {
    낮음: "차분하고 안정적인 흐름입니다. 지금의 리듬을 유지하는 것이 가장 좋습니다.",
    "약간 낮음":
      "긴장도가 낮아 여유가 있는 편입니다. 작은 변화에도 잘 적응할 수 있습니다.",
    보통: "신경이 예민해질 수 있는 정도입니다. 불필요한 자극을 조금만 줄여보세요.",
    "약간 높음":
      "예상치 못한 상황에서 긴장이 생길 수 있습니다. 호흡을 천천히 길게 가져가면 좋습니다.",
    높음: "과각성이 유지될 수 있습니다. 해야 할 일을 작게 나누면 부담이 빠르게 줄어듭니다.",
  },
  S: {
    낮음: "스트레스 반응이 낮은 편입니다. 지금의 페이스를 자연스럽게 이어가면 좋습니다.",
    "약간 낮음":
      "기본적인 긴장도가 낮은 흐름입니다. 작업·휴식 균형을 유지하세요.",
    보통: "부담을 느끼는 순간이 있지만 자연스러운 범위입니다. 휴식 구간을 명확히 두면 좋습니다.",
    "약간 높음":
      "압박을 쉽게 느낄 수 있습니다. 업무를 작은 단위의 덩어리로 나누면 도움이 됩니다.",
    높음: "긴장도가 높아질 수 있는 시기입니다. 3분 정도의 짧은 멈춤 루틴이 효과적입니다.",
  },
};

//  main
window.onload = () => {
  const data = sessionStorage.getItem("scaleScores");
  const container = document.getElementById("result-container");

  if (!data) {
    container.innerHTML = "<p>결과가 없습니다.</p>";
    return;
  }

  const scores = JSON.parse(data);

  fetch("../assets/dass_resource.json")
    .then((res) => res.json())
    .then((json) => {
      const stat = json.statistics;

      const z = {
        D: (scores.D - stat.D.mean) / stat.D.sd,
        A: (scores.A - stat.A.mean) / stat.A.sd,
        S: (scores.S - stat.S.mean) / stat.S.sd,
      };

      const title = {
        D: "우울 (Depression)",
        A: "불안 (Anxiety)",
        S: "스트레스 (Stress)",
      };

      const desc = {
        D: "우울은 무기력감·슬픔·흥미 상실 등 정서적 저하를 나타냅니다.",
        A: "불안은 예측적 긴장·과각성·위협 민감성을 반영합니다.",
        S: "스트레스는 과부하·압박·긴장 경험의 강도를 의미합니다.",
      };

      ["D", "A", "S"].forEach((key) => {
        const mean = stat[key].mean;
        const raw = scores[key];

        const pct = normalCDF(z[key]) * 100;

        let level = "";
        if (pct < 16) level = "낮음";
        else if (pct < 33) level = "약간 낮음";
        else if (pct < 66) level = "보통";
        else if (pct < 83) level = "약간 높음";
        else level = "높음";

        // 결과 고지 블록
        const block = document.createElement("div");
        block.className = "factor-block";

        block.innerHTML = `
          <div class="factor-title">${title[key]}</div>
          <div class="factor-description">${desc[key]}</div>

          <div class="factor-comment">
            당신의 위치는 <b>${pct.toFixed(1)}%</b> — <b>${level}</b>
          </div>

          <div class="chart-slot" id="chart-${key}"></div>

          <p class="score-info">
            내 점수: ${raw}점<br>
            집단 평균: ${mean.toFixed(1)}점
          </p>

          <div class="advice">
            ${advice[key][level]}
          </div>
        `;

        container.appendChild(block);
        // 차트 슬롯에서 canvas 생성
        const slot = block.querySelector(`#chart-${key}`);
        const canvas = document.createElement("canvas");
        canvas.id = `chart-canvas-${key}`;
        slot.appendChild(canvas);

        const ctx = canvas.getContext("2d");

        const dassChart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["사용자", "평균"],
            datasets: [
              {
                label: title[key],
                data: [0, 0],
                backgroundColor: [
                  "rgba(64, 224, 208, 0.88)", // 사용자
                  "rgba(255, 206, 86, 0.75)", // 평균
                ],
                borderColor: ["rgba(23, 74, 91, 1)", "rgba(210, 170, 60, 1)"],
                borderWidth: 1.8,
                borderRadius: 10,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            animation: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 42, // y축 최댓값 고정 (42점)
                ticks: { stepSize: 7 },
              },
            },
          },
        });

        // 막대 애니메이션
        function animateSingleChart(chart, targetData, duration = 1200) {
          let start = null;

          function step(ts) {
            if (!start) start = ts;
            const p = Math.min((ts - start) / duration, 1);

            chart.data.datasets[0].data = targetData.map((v) => v * p);
            chart.update();

            if (p < 1) requestAnimationFrame(step);
          }

          requestAnimationFrame(step);
        }

        animateSingleChart(dassChart, [raw, mean]);
      });
    });

  document.getElementById("btn-home").onclick = () => {
    window.location.href = "../index.html";
  };
};
