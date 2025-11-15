window.onload = () => {
  const result = sessionStorage.getItem("crtResult");
  const container = document.getElementById("result-container");

  if (!result) {
    container.innerHTML =
      "<p>검사 결과가 없습니다. 다시 검사를 진행해주세요.</p>";
    return;
  }
};
