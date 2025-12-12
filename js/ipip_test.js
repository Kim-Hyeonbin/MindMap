window.onload = function () {
  fetch("../assets/ipip_resource.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("파일을 불러올 수 없습니다.");
      }
      return response.json();
    })
    .then((data) => {
      const container = document.getElementById("test-container");

      data.question.forEach((q) => {
        const div = document.createElement("div");
        div.className = "question";

        div.innerHTML = `<p>${q.id}. ${q.text}</p>
                    <div class="options">
                        <label><input type="radio" name="q${q.id}" value="1" data-factor="${q.factor}" data-key="${q.key}">전혀 그렇지 않다</label>
                        <label><input type="radio" name="q${q.id}" value="2" data-factor="${q.factor}" data-key="${q.key}">그렇지 않다</label>
                        <label><input type="radio" name="q${q.id}" value="3" data-factor="${q.factor}" data-key="${q.key}">보통이다</label>
                        <label><input type="radio" name="q${q.id}" value="4" data-factor="${q.factor}" data-key="${q.key}">그렇다</label>
                        <label><input type="radio" name="q${q.id}" value="5" data-factor="${q.factor}" data-key="${q.key}">매우 그렇다</label>
                    </div>`;
        container.appendChild(div);
      });
    })
    .catch(() => {
      container.innerHTML =
        "<p>검사 데이터를 불러오지 못했습니다.<br>홈 화면으로 이동합니다.</p>";
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1500);
    });

  const submitBtn = document.getElementById("submit-btn");
  submitBtn.addEventListener("click", () => {
    const questions = document.querySelectorAll(".question");
    const unanswered = [];

    // 응답 누락 검사
    questions.forEach((q, idx) => {
      const checked = q.querySelector('input[type="radio"]:checked');
      if (!checked) unanswered.push(idx + 1);
    });

    if (unanswered.length > 0) {
      alert(
        `${unanswered
          .map((n) => n + "번")
          .join(", ")} 문항이 응답되지 않았습니다!`
      );
      return;
    }

    // 점수 계산
    const factorScores = {
      외향성: 0,
      "원만성/호감성": 0,
      성실성: 0,
      "정서적 안정성": 0,
      "지성/상상력": 0,
    };

    questions.forEach((q) => {
      const selected = q.querySelector('input[type="radio"]:checked');
      const factor = selected.dataset.factor;
      const key = selected.dataset.key;
      const val = Number(selected.value);

      factorScores[factor] += key === "+" ? val : 6 - val;
    });

    // 데이터 정규화
    for (let key in factorScores) {
      factorScores[key] = parseFloat((factorScores[key] / 10).toFixed(3));
    }

    console.log(factorScores);

    // 세션 스토리지에 설문 결과 저장
    sessionStorage.setItem("factorScores", JSON.stringify(factorScores));

    // 결과 페이지로 이동
    window.location.href = "../results/ipip_result.html";
  });
};
