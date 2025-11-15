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

      // 총 정답 개수 표시
      const totalScore = result.correct.length;
      const maxScore = questions.length;

      container.innerHTML += `
        <h2>총 정답: ${totalScore} / ${maxScore}</h2>
        <hr/>
      `;

      // 문항별 상세 결과 표시
      questions.forEach((q) => {
        let status = "";

        if (result.correct.includes(q.id)) {
          status = "⭕ 정답";
        } else if (result.intuitive_wrong.includes(q.id)) {
          status = "❌ 직관적 오답";
        } else {
          status = "❌ 기타 오답";
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
    });

  document.getElementById("btn-home").addEventListener("click", () => {
    // GitHub Pages 절대경로로 이동
    window.location.href = "https://kim-hyeonbin.github.io/MindMap/index.html";
  });
};
