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
  fetch("https://kim-hyeonbin.github.io/MindMap/assets/ipip_questions.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("통계 데이터를 불러올 수 없습니다.");
      }
      return response.json();
    })
    .then((json) => {
      const status = json.statistics;

      for (let key in scores) {
        const div = document.createElement("div");
        const stat = status[key];

        if (!stat) continue;

        if (scores[key] > stat.mean + stat.sd) {
          div.innerHTML = `<strong>${key}</strong>: 매우 높은 편 
          (${scores[key]}점, 평균 ${stat.mean})`;
        } else if (scores[key] > stat.mean + stat.sd / 2) {
          div.innerHTML = `<strong>${key}</strong>: 약간 높은 편 
          (${scores[key]}점, 평균 ${stat.mean})`;
        } else if (scores[key] < stat.mean - stat.sd) {
          div.innerHTML = `<strong>${key}</strong>: 매우 낮은 편 
          (${scores[key]}점, 평균 ${stat.mean})`;
        } else if (scores[key] < stat.mean - stat.sd / 2) {
          div.innerHTML = `<strong>${key}</strong>: 약간 낮은 편 
          (${scores[key]}점, 평균 ${stat.mean})`;
        } else {
          div.innerHTML = `<strong>${key}</strong>: 보통 수준 
          (${scores[key]}점, 평균 ${stat.mean})`;
        }

        container.appendChild(div);
      }
    });

  document.getElementById("btn-home").addEventListener("click", () => {
    // GitHub Pages 절대경로로 이동
    window.location.href = "https://kim-hyeonbin.github.io/MindMap/index.html";
  });
};
