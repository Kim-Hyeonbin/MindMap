// 파이 차트 부드럽게 애니메이션
function animatePie(chart, targetData, duration = 1200) {
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

window.onload = () => {
  const raw = sessionStorage.getItem("crtResult");
  const result = raw ? JSON.parse(raw) : null;
  const container = document.getElementById("result-container");

  // 세션 스토리지로 검사 결과를 전달받지 못한 상황 예외 처리
  if (!result) {
    container.innerHTML =
      "<p>검사 결과가 없습니다.<br>다시 검사를 진행해주세요.<br>홈 화면으로 이동합니다.</p>";
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1500);
    return;
  }

  fetch("../assets/crt_resource.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("통계 데이터를 불러올 수 없습니다.");
      }
      return response.json();
    })
    .then((data) => {
      const questions = data.question;
      const globalStats = data.global_stats["정답률"];

      const correctCount = result.correct.length;
      const intuitiveCount = result.intuitive_wrong.length;
      const otherCount =
        result.other?.length ??
        questions.length - correctCount - intuitiveCount;

      const totalScore = correctCount;
      const maxScore = questions.length;

      container.innerHTML += `
        <h2>총 정답: ${totalScore} / ${maxScore}</h2>
      `;

      // 전체 분포 섹션 HTML 생성
      container.innerHTML += `
        <section class="result-block" id="dist-block">
          <h3>📊 전체 분포와 비교</h3>

          <div style="width:240px; height:240px; margin:0 auto;">
            <canvas id="overallPie"></canvas>
          </div>

          <p class="distribution-text" style="margin-top:10px;">
            · 0개 정답: ${globalStats["0"]}%<br>
            · 1개 정답: ${globalStats["1"]}%<br>
            · 2개 정답: ${globalStats["2"]}%<br>
            · 3개 정답: ${globalStats["3"]}%<br><br>
            <strong>→ 당신은 ${totalScore}점 그룹에 속합니다.</strong>
          </p>
        </section>
      `;

      // 전체 분포 파이 차트 생성 (DOM 생성 이후)
      // 약간 딜레이를 줘서 DOM 안정화
      setTimeout(() => {
        const ctx = document.getElementById("overallPie");
        const overallPie = new Chart(ctx, {
          type: "pie",
          data: {
            labels: ["0개 정답", "1개 정답", "2개 정답", "3개 정답"],
            datasets: [
              {
                data: [0, 0, 0, 0],
                backgroundColor: ["#3bb4c1", "#2d8f9a", "#ffb74d", "#ef5350"],
                borderColor: ["#3bb4c1", "#2d8f9a", "#ffb74d", "#ef5350"],
                borderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: "bottom" } },
          },
        });

        animatePie(overallPie, [17, 17.5, 24.3, 41.3]);
      }, 30);

      // 문항별 결과 렌더링 + 각 항목 파이 차트 생성
      container.innerHTML += `<h3>📝 문항별 결과</h3>`;

      questions.forEach((q) => {
        let statusClass = "";
        let statusText = "";

        if (result.correct.includes(q.id)) {
          statusClass = "eval-correct";
          statusText = "⭕ 정답";
        } else if (result.intuitive_wrong.includes(q.id)) {
          statusClass = "eval-intuitive";
          statusText = "❌ 직관적인 오답";
        } else {
          statusClass = "eval-other";
          statusText = "❌ 오답";
        }

        container.innerHTML += `
          <div class="result-item">
            <p><strong>${q.id}. ${q.text}</strong></p>
            <p>정답: ${q["정답"]}</p>
            <p class="result-eval ${statusClass}">${statusText}</p>

            <div style="width:180px; height:180px; margin:0 auto;">
              <canvas id="itemPie-${q.id}"></canvas>
            </div>

            <p class="item-stats">
              정답률: ${q.stats["숙고적"]}%<br>
              직관적 오답률: ${q.stats["직관적"]}%<br>
              그 외 오답률: ${q.stats["그 외"]}%
            </p>
          </div>
        `;

        setTimeout(() => {
          const itemCtx = document.getElementById(`itemPie-${q.id}`);
          const itemPie = new Chart(itemCtx, {
            type: "pie",
            data: {
              labels: ["정답", "직관적인 오답", "그 외 오답"],
              datasets: [
                {
                  data: [0, 0, 0],
                  backgroundColor: [
                    "rgba(64, 224, 208, .92)",
                    "rgba(255, 159, 64, .92)",
                    "rgba(153, 102, 255, .92)",
                  ],
                  borderColor: [
                    "rgba(64, 224, 208, 1)",
                    "rgba(255, 159, 64, 1)",
                    "rgba(153, 102, 255, 1)",
                  ],
                  borderWidth: 2,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: "bottom" } },
            },
          });

          animatePie(itemPie, [
            q.stats["숙고적"],
            q.stats["직관적"],
            q.stats["그 외"],
          ]);
        }, 50);
      });

      // 짧은 조언 제공
      let advice = "";
      if (totalScore === 3) {
        advice =
          "당신의 사고는 매우 안정적으로 구조를 잡아냅니다. 중요한 판단에서도 균형 잡힌 시야가 유지됩니다.";
      } else if (totalScore === 2) {
        advice =
          "직관과 숙고가 조화를 이루는 편이며, 상황 대응력에서 강점을 보입니다.";
      } else if (totalScore === 1) {
        advice =
          "첫 느낌이 강하게 작용하기 때문에 중요한 선택에서는 ‘잠시 멈춤’이 큰 차이를 만듭니다.";
      } else {
        advice =
          "빠른 판단이 장점이지만, 사고 전환을 의식적으로 훈련하면 판단 정확도가 더 안정됩니다.";
      }

      container.innerHTML += `
        <section class="result-block advice-block">
          <h3>💡 짧은 조언</h3>
          <p>${advice}</p>
        </section>
      `;
    })
    .catch(() => {
      container.innerHTML =
        "<p>검사 데이터를 불러오지 못했습니다.<br>홈 화면으로 이동합니다.</p>";
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1500);
    });

  document.getElementById("btn-home").onclick = () => {
    window.location.href = "../index.html";
  };
};
