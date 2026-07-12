// 게시판(커뮤니티) 기능 스크립트
// 목록 조회, 글 작성/수정/삭제, 검색, 페이지네이션, 댓글 등은 이후 단계에서 구현 예정

// 비로그인 상태면 목록 페이지의 글쓰기 버튼을 숨김
async function guardWriteButton() {
    const writeBtn = document.getElementById('write-btn');
    if (!writeBtn) return;

    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        writeBtn.style.display = 'none';
    }
}

// 비로그인 상태로 글쓰기 페이지에 직접 접근하면 로그인 페이지로 이동
async function guardWritePage() {
    const writeForm = document.querySelector('.post-form');
    if (!writeForm) return;

    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        location.href = '../login.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    guardWriteButton();
    guardWritePage();
});
