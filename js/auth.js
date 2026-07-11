// 로그인/회원가입 및 로그인 상태 관리 스크립트

// 폼 위/아래 메시지 영역에 결과 문구 표시
function showAuthMessage(formEl, text, isError) {
    const messageEl = formEl.querySelector('.auth-message');
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.classList.toggle('auth-message-error', isError);
}

// 헤더의 로그인 상태 영역(nav-auth)을 현재 세션에 맞게 갱신
async function updateAuthUI() {
    const navAuth = document.getElementById('nav-auth');
    if (!navAuth) return;

    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
        navAuth.innerHTML = `
            <span class="nav-auth-email">${session.user.email}</span>
            <button type="button" class="nav-auth-link nav-auth-logout" id="logout-btn">로그아웃</button>
        `;
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
    }
}

// 로그아웃 처리
async function handleLogout() {
    await supabaseClient.auth.signOut();
    location.reload();
}

// 로그인 폼 처리
function initLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

        if (error) {
            showAuthMessage(form, '로그인에 실패했습니다: ' + error.message, true);
            return;
        }

        location.href = form.dataset.redirect || 'index.html';
    });
}

// 회원가입 폼 처리
function initSignupForm() {
    const form = document.getElementById('signup-form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const passwordConfirm = document.getElementById('signup-password-confirm').value;

        if (password !== passwordConfirm) {
            showAuthMessage(form, '비밀번호가 일치하지 않습니다.', true);
            return;
        }

        const { error } = await supabaseClient.auth.signUp({ email, password });

        if (error) {
            showAuthMessage(form, '회원가입에 실패했습니다: ' + error.message, true);
            return;
        }

        showAuthMessage(form, '회원가입이 완료되었습니다. 이메일 인증 후 로그인해주세요.', false);
        form.reset();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    initLoginForm();
    initSignupForm();
});
