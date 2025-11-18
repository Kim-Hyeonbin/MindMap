window.onload = () => {
  // 세션 스토리지에서 사용자 입력 가져오기
  const raw = sessionStorage.getItem("crtResult");
  const result = JSON.parse(raw);

  const container = document.getElementById("result-container");

  if (!result) {
    container.innerHTML = "<p>결과가 없습니다. 다시 검사를 진행해주세요.</p>";
    return;
  }

  // JSON에서 문항 정보 불러오기
  fetch("../assets/crt_resource.json")
    .then((res) => res.json())
    .then((data) => {
      const questions = data.question;
      const globalStats = data.global_stats["정답률"];

      // 총 정답 개수 표시
      const totalScore = result.correct.length;
      const maxScore = questions.length;

      container.innerHTML += `
        <h2>총 정답: ${totalScore} / ${maxScore}</h2>
      `;

      //  사고 유형 분류 (점수 + 직관적 오답 기반)

      const correctCount = result.correct.length;
      const intuitiveCount = result.intuitive_wrong.length;
      const otherCount = result.other
        ? result.other.length
        : maxScore - correctCount - intuitiveCount;

      let thinkerType = "";
      let thinkerDesc = "";

      if (correctCount === maxScore) {
        // 3개 모두 정답
        thinkerType = "Analytical Thinker (숙고형 사고자)";
        thinkerDesc =
          "직관에 바로 반응하기보다는, 잠시 멈추어 사고한 뒤 결론에 도달하는 경향이 강합니다.";
      } else if (correctCount >= 2) {
        // 정답이 2개 이상이지만, 일부 직관/오답 섞임
        thinkerType = "Mixed Thinker (혼합형 사고자)";
        thinkerDesc =
          "전반적으로 숙고적 사고가 잘 작동하지만, 일부 상황에서는 직관이나 추측이 개입하는 양상이 보입니다.";
      } else if (correctCount <= 1) {
        // 정답이 0~1개인 경우, 오답의 성격을 추가로 본다
        if (intuitiveCount > otherCount) {
          // 직관적 오답이 더 많음
          thinkerType = "Intuitive-biased Thinker (직관 편향형)";
          thinkerDesc =
            "첫 느낌이 강하게 작동하며, 빠른 판단이 우선하는 경향이 있습니다. 계산보다는 즉각적인 인상이 먼저 반응합니다.";
        } else if (otherCount > intuitiveCount) {
          // 직관적 오답도 아니고, 정답과도 거리가 있는 답이 많음
          thinkerType = "Guess-driven Thinker (추측형 사고자)";
          thinkerDesc =
            "직관적인 계산 패턴보다는, 답을 확신하지 못한 채 추측에 기대는 경향이 나타납니다. 문제 구조를 파악하기 전에 답을 선택했을 가능성이 높습니다.";
        } else {
          // 직관적 오답과 기타 오답이 비슷하게 섞인 경우
          thinkerType = "Unstable Mixed Thinker (불안정 혼합형)";
          thinkerDesc =
            "직관과 추측이 섞여 나타나며, 어느 한 쪽도 일관되게 우세하지는 않습니다. 문제마다 전혀 다른 패턴이 드러납니다.";
        }
      }

      container.innerHTML += `
        <section class="analysis-block">
          <h3>🧠 사고 유형 분석</h3>
          <p><strong>${thinkerType}</strong></p>
          <p>${thinkerDesc}</p>
          <hr/>
        </section>
      `;

      // 전체 분포에서의 위치 (global_stats 활용)

      const distributionText = `
        <p>전체 집단 기준:</p>
        <p>· 0개 정답: ${globalStats["0"]}%</p>
        <p>· 1개 정답: ${globalStats["1"]}%</p>
        <p>· 2개 정답: ${globalStats["2"]}%</p>
        <p>· 3개 정답: ${globalStats["3"]}%</p>
      `;

      container.innerHTML += `
        <section class="distribution-block">
          <h3>📊 전체 분포와의 비교</h3>
          ${distributionText}
          <p><strong>→ 당신은 이 분포에서 ${totalScore}점 그룹에 속합니다.</strong></p>
          <hr/>
        </section>
      `;

      // 문항별 상세 결과 표시

      container.innerHTML += `<h3>📝 문항별 결과</h3>`;

      questions.forEach((q) => {
        let status = "";

        if (result.correct.includes(q.id)) {
          status = "⭕ 정답";
        } else if (result.intuitive_wrong.includes(q.id)) {
          status = "❌ 직관적 오답";
        } else {
          status = "❌ 오답";
        }

        container.innerHTML += `
          <div class="result-item">
            <p><strong>${q.id}. ${q.text}</strong></p>
            <p>정답: ${q["정답"]}</p>
            <p>평가: ${status}</p>
            <p>문항 정답률: ${q.stats["숙고적"]}%</p>
            <hr/>
          </div>
        `;
      });

      // 간단한 조언 (점수 기반)

      let advice = "";

      if (totalScore === 3) {
        advice =
          "당신의 사고는 차분하게 조율되어 있으며, 복잡한 상황에서도 쉽게 흔들리지 않습니다.";
      } else if (totalScore === 2) {
        advice =
          "때로는 직관을 믿고, 때로는 멈추어 생각하는 방식이 균형을 이룹니다. 이 균형은 큰 장점입니다.";
      } else if (totalScore === 1) {
        advice =
          "빠른 판단이 강점이지만, 중요한 선택일수록 한 번 더 생각하는 습관이 많은 것을 바꿉니다.";
      } else {
        advice =
          "직관은 샘물처럼 빠르지만, 판단은 때로 무거운 발걸음을 필요로 합니다. '잠시 멈춤'이 사고 정확성을 끌어올려 줍니다.";
      }

      container.innerHTML += `
        <section class="advice-block">
          <h3>💡 짧은 조언</h3>
          <p>${advice}</p>
        </section>
      `;
    });

  document.getElementById("btn-home").addEventListener("click", () => {
    window.location.href = "https://kim-hyeonbin.github.io/MindMap/index.html";
  });
};
