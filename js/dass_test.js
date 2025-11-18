window.onload = function () {
  fetch("../assets/dass_resource.json")
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

        // 문항 별 슬라이더 추가
        div.innerHTML = `<p>${q.id}. ${q.text}</p>
                    <div class="options slider-options">
                        <input 
                            type="range" 
                            min="0" 
                            max="3" 
                            step="1" 
                            value="0" 
                            class="dass-slider" 
                            name="q${q.id}" 
                            data-scale="${q.scale}"  
                            id="q${q.id}-slider"
                        >

                        <div class="slider-labels">
                            <span>전혀 아니다</span>
                            <span>약간 그렇다</span>
                            <span>상당히 그렇다</span>
                            <span>매우 그렇다</span>
                        </div>

                    </div>
                    `;

        container.appendChild(div);
      });
    });

  const submitBtn = document.getElementById("submit-btn");
  submitBtn.addEventListener("click", () => {
    const questions = document.querySelectorAll(".question");

    // 점수 계산
    const scaleScores = {
      S: 0,
      A: 0,
      D: 0,
    };

    questions.forEach((q) => {
      // 슬라이더 가져오기
      const slider = q.querySelector(".dass-slider");
      const scale = slider.dataset.scale; // S / A / D
      const val = Number(slider.value); // 0~3 점수

      // 점수 누적
      scaleScores[scale] += val;
    });

    console.log(scaleScores);

    // 세션 스토리지에 설문 결과 저장
    sessionStorage.setItem("scaleScores", JSON.stringify(scaleScores));

    // 결과 페이지로 이동
    window.location.href = "../results/dass_result.html";
  });
};
