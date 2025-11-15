window.onload = function () {
  fetch("../assets/crt_resource.json")
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

        div.innerHTML = `
        <p><strong>${q.id}. ${q.text}</strong></p>
        <input type="number" class="crt-input" data-id="${q.id}" value ="0"/>
        `;
        container.appendChild(div);
      });

      const submitBtn = document.getElementById("submit-btn");
      submitBtn.addEventListener("click", () => {
        const inputs = document.querySelectorAll(".crt-input");
        const answers = [];

        // 사용자의 각 입력을 배열로 받기
        inputs.forEach((input) => {
          const id = Number(input.dataset.id);
          const value = Number(input.value);

          answers.push({
            id: id,
            userAnswer: value,
          });
        });

        // 정답 객체 만들기
        const answerMap = {};
        data.question.forEach((q) => {
          answerMap[q.id] = [q["정답"], q["직관적 오답"]];
        });

        // 결과를 저장할 객체
        let result = {
          correct: [],
          intuitive_wrong: [],
          other: [],
        };

        // 결과 처리
        answers.forEach((a) => {
          // answerMap[a.id]의 0번 인덱스가 정답
          if (a.userAnswer == answerMap[a.id][0]) {
            result.correct.push(a.id);
          }
          // answerMap[a.id]의 1번 인덱스가 직관적 오답
          else if (a.userAnswer == answerMap[a.id][1]) {
            result.intuitive_wrong.push(a.id);
          }
          // 그 외 오답
          else {
            result.other.push(a.id);
          }
        });

        // 세션 스토리지에 결과 저장
        sessionStorage.setItem("crtResult", JSON.stringify(result));

        // 결과 페이지로 이동
        window.location.href = "../results/crt_result.html";
      });
    });
};
