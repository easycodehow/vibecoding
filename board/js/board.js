// 게시판(커뮤니티) 기능 스크립트
// 목록 조회/검색/페이지네이션, 글 작성·수정·삭제, 상세보기+조회수, 댓글 작성·수정·삭제

const PAGE_SIZE = 10;
const PAGE_GROUP_SIZE = 5;

// ==========================================================================
// 공통 유틸
// ==========================================================================

// 이메일에서 @ 앞부분만 표시용 이름으로 사용
function emailToName(email) {
    return email ? email.split('@')[0] : '알 수 없음';
}

// ISO 날짜 문자열을 YYYY.MM.DD 형식으로 변환
function formatDate(iso) {
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd}`;
}

// XSS 방지를 위한 텍스트 이스케이프
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
}

// post-images 버킷의 공개 URL에서 스토리지 경로만 추출
function extractStoragePath(url) {
    const marker = '/post-images/';
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(url.slice(idx + marker.length));
}

async function deleteStorageImage(url) {
    const path = extractStoragePath(url);
    if (!path) return;
    await supabaseClient.storage.from('post-images').remove([path]);
}

// ==========================================================================
// 글쓰기 버튼/페이지 로그인 가드
// ==========================================================================

async function guardWriteButton() {
    const writeBtn = document.getElementById('write-btn');
    if (!writeBtn) return;

    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        writeBtn.style.display = 'none';
    }
}

async function guardWritePage() {
    const writeForm = document.getElementById('post-form');
    if (!writeForm) return;

    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        location.href = '../login.html';
    }
}

// ==========================================================================
// 게시글 목록 (board.html)
// ==========================================================================

function goToPage(page, search) {
    const params = new URLSearchParams();
    params.set('page', page);
    if (search) params.set('search', search);
    location.href = 'board.html?' + params.toString();
}

function renderPagination(container, totalCount, page, search) {
    if (!container) return;

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const groupStart = Math.floor((page - 1) / PAGE_GROUP_SIZE) * PAGE_GROUP_SIZE + 1;
    const groupEnd = Math.min(groupStart + PAGE_GROUP_SIZE - 1, totalPages);

    container.innerHTML = '';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'page-btn';
    prevBtn.textContent = '이전';
    if (groupStart === 1) {
        prevBtn.disabled = true;
    } else {
        prevBtn.addEventListener('click', () => goToPage(groupStart - 1, search));
    }
    container.appendChild(prevBtn);

    for (let p = groupStart; p <= groupEnd; p++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'page-btn' + (p === page ? ' active' : '');
        btn.textContent = String(p);
        btn.addEventListener('click', () => goToPage(p, search));
        container.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'page-btn';
    nextBtn.textContent = '다음';
    if (groupEnd >= totalPages) {
        nextBtn.disabled = true;
    } else {
        nextBtn.addEventListener('click', () => goToPage(groupEnd + 1, search));
    }
    container.appendChild(nextBtn);
}

const POST_IMAGE_ICON = `<svg class="post-image-icon" viewBox="0 0 16 16" aria-label="이미지 첨부"><rect x="1" y="2" width="14" height="12" rx="2" fill="none" stroke="#8B5CF6" stroke-width="1.3"/><circle cx="5.5" cy="6.5" r="1.3" fill="#8B5CF6"/><path d="M2 12.5L6 8.5L9 11.5L11 9L14.5 12.5" fill="none" stroke="#8B5CF6" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/></svg>`;

async function loadPostList() {
    const tbody = document.getElementById('post-list-body');
    if (!tbody) return;

    const params = new URLSearchParams(location.search);
    const page = Math.max(1, parseInt(params.get('page') || '1', 10));
    const search = params.get('search') || '';

    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = search;

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabaseClient
        .from('posts')
        .select('id, title, author_email, created_at, view_count, image_url, comments(count)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (search) {
        query = query.ilike('title', `%${search}%`);
    }

    const { data, count, error } = await query;

    if (error) {
        tbody.innerHTML = '<tr><td colspan="5">목록을 불러오지 못했습니다.</td></tr>';
        return;
    }

    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">게시글이 없습니다.</td></tr>';
    } else {
        tbody.innerHTML = data.map((post) => {
            const commentCount = post.comments?.[0]?.count || 0;
            return `
                <tr>
                    <td>${post.id}</td>
                    <td class="col-title">
                        <a href="board-detail.html?id=${post.id}">${escapeHtml(post.title)}</a>
                        ${commentCount > 0 ? `<span class="comment-count-badge">[${commentCount}]</span>` : ''}
                        ${post.image_url ? POST_IMAGE_ICON : ''}
                    </td>
                    <td>${escapeHtml(emailToName(post.author_email))}</td>
                    <td>${formatDate(post.created_at)}</td>
                    <td>${post.view_count}</td>
                </tr>
            `;
        }).join('');
    }

    renderPagination(document.getElementById('pagination'), count || 0, page, search);
}

function initSearchForm() {
    const form = document.getElementById('search-form');
    if (!form) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const value = document.getElementById('search-input').value.trim();
        goToPage(1, value);
    });
}

// ==========================================================================
// 최근 게시물 (index.html)
// ==========================================================================

async function loadRecentPosts() {
    const tbody = document.getElementById('recent-post-body');
    if (!tbody) return;

    const { data, error } = await supabaseClient
        .from('posts')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

    if (error || !data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2">게시글이 없습니다.</td></tr>';
        return;
    }

    tbody.innerHTML = data.map((post) => `
        <tr>
            <td class="col-title"><a href="board/board-detail.html?id=${post.id}">${escapeHtml(post.title)}</a></td>
            <td>${formatDate(post.created_at)}</td>
        </tr>
    `).join('');
}

// ==========================================================================
// 글쓰기 / 수정 (board-write.html)
// ==========================================================================

async function initWritePage() {
    const form = document.getElementById('post-form');
    if (!form) return;

    const params = new URLSearchParams(location.search);
    const editId = params.get('id');

    const titleInput = document.getElementById('post-title');
    const contentInput = document.getElementById('post-content');
    const imageInput = document.getElementById('post-image');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    const removeImageBtn = document.getElementById('remove-image-btn');
    const submitBtn = document.getElementById('submit-btn');

    let existingImageUrl = null;
    let imageRemoved = false;
    let selectedFile = null;

    if (editId) {
        document.querySelector('h2').textContent = '글 수정';
        document.title = '글 수정 | 바이브코딩';
        submitBtn.textContent = '수정 완료';

        const { data: post, error } = await supabaseClient
            .from('posts')
            .select('*')
            .eq('id', editId)
            .single();

        if (error || !post) {
            alert('게시글을 찾을 수 없습니다.');
            location.href = 'board.html';
            return;
        }

        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session || session.user.id !== post.author_id) {
            alert('본인 글만 수정할 수 있습니다.');
            location.href = `board-detail.html?id=${editId}`;
            return;
        }

        titleInput.value = post.title;
        contentInput.value = post.content;
        if (post.image_url) {
            existingImageUrl = post.image_url;
            previewImg.src = post.image_url;
            imagePreview.hidden = false;
        }
    }

    imageInput.addEventListener('change', () => {
        const file = imageInput.files[0];
        if (!file) return;
        selectedFile = file;
        imageRemoved = false;
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            imagePreview.hidden = false;
        };
        reader.readAsDataURL(file);
    });

    removeImageBtn.addEventListener('click', () => {
        selectedFile = null;
        imageRemoved = true;
        imageInput.value = '';
        previewImg.src = '';
        imagePreview.hidden = true;
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
            location.href = '../login.html';
            return;
        }

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title || !content) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = '저장 중...';

        let imageUrl = imageRemoved ? null : existingImageUrl;

        if (selectedFile) {
            const filePath = `${session.user.id}/${Date.now()}-${selectedFile.name}`;
            const { error: uploadError } = await supabaseClient.storage
                .from('post-images')
                .upload(filePath, selectedFile);

            if (uploadError) {
                alert('이미지 업로드에 실패했습니다: ' + uploadError.message);
                submitBtn.disabled = false;
                submitBtn.textContent = editId ? '수정 완료' : '등록';
                return;
            }

            const { data: publicUrlData } = supabaseClient.storage
                .from('post-images')
                .getPublicUrl(filePath);
            imageUrl = publicUrlData.publicUrl;

            if (existingImageUrl) {
                await deleteStorageImage(existingImageUrl);
            }
        } else if (imageRemoved && existingImageUrl) {
            await deleteStorageImage(existingImageUrl);
        }

        if (editId) {
            const { error } = await supabaseClient
                .from('posts')
                .update({ title, content, image_url: imageUrl })
                .eq('id', editId);

            if (error) {
                alert('수정에 실패했습니다: ' + error.message);
                submitBtn.disabled = false;
                submitBtn.textContent = '수정 완료';
                return;
            }

            location.href = `board-detail.html?id=${editId}`;
        } else {
            const { data, error } = await supabaseClient
                .from('posts')
                .insert({
                    title,
                    content,
                    image_url: imageUrl,
                    author_id: session.user.id,
                    author_email: session.user.email,
                })
                .select()
                .single();

            if (error) {
                alert('등록에 실패했습니다: ' + error.message);
                submitBtn.disabled = false;
                submitBtn.textContent = '등록';
                return;
            }

            location.href = `board-detail.html?id=${data.id}`;
        }
    });
}

// ==========================================================================
// 상세보기 + 댓글 (board-detail.html)
// ==========================================================================

async function initDetailPage() {
    const article = document.getElementById('post-detail');
    if (!article) return;

    const params = new URLSearchParams(location.search);
    const postId = params.get('id');

    if (!postId) {
        location.href = 'board.html';
        return;
    }

    // 조회수 증가 (security definer RPC, 로그인 여부 무관하게 호출)
    await supabaseClient.rpc('increment_view_count', { post_id: postId });

    const { data: post, error } = await supabaseClient
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();

    if (error || !post) {
        alert('게시글을 찾을 수 없습니다.');
        location.href = 'board.html';
        return;
    }

    document.getElementById('post-title').textContent = post.title;
    document.getElementById('post-author').textContent = emailToName(post.author_email);
    document.getElementById('post-date').textContent = formatDate(post.created_at);
    document.getElementById('post-views').textContent = `조회수 ${post.view_count}`;
    document.getElementById('post-content').innerHTML = escapeHtml(post.content).replace(/\n/g, '<br>');
    document.title = `${post.title} | 바이브코딩`;

    if (post.image_url) {
        document.getElementById('post-image-el').src = post.image_url;
        document.getElementById('post-image-wrap').hidden = false;
    }

    const { data: { session } } = await supabaseClient.auth.getSession();
    const editLink = document.getElementById('edit-link');
    const deleteBtn = document.getElementById('delete-btn');

    let isAdmin = false;
    if (session) {
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
        isAdmin = profile?.role === 'admin';
    }

    const isOwner = !!session && session.user.id === post.author_id;

    if (isOwner) {
        editLink.href = `board-write.html?id=${post.id}`;
        editLink.hidden = false;
    }

    if (isOwner || isAdmin) {
        deleteBtn.hidden = false;
        deleteBtn.addEventListener('click', async () => {
            if (!confirm('정말 삭제하시겠습니까?')) return;

            if (post.image_url) {
                await deleteStorageImage(post.image_url);
            }

            const { error: deleteError } = await supabaseClient
                .from('posts')
                .delete()
                .eq('id', post.id);

            if (deleteError) {
                alert('삭제에 실패했습니다: ' + deleteError.message);
                return;
            }

            location.href = 'board.html';
        });
    }

    await loadComments(postId, session);
    initCommentForm(postId, session);
}

async function loadComments(postId, session) {
    const list = document.getElementById('comment-list');
    const countEl = document.getElementById('comment-count');

    const { data: comments, error } = await supabaseClient
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

    if (error) {
        list.innerHTML = '<li class="comment-item">댓글을 불러오지 못했습니다.</li>';
        return;
    }

    countEl.textContent = String(comments.length);

    if (comments.length === 0) {
        list.innerHTML = '<li class="comment-item">첫 댓글을 남겨보세요.</li>';
        return;
    }

    list.innerHTML = '';
    comments.forEach((comment) => {
        const li = document.createElement('li');
        li.className = 'comment-item';

        const isOwner = !!session && session.user.id === comment.author_id;

        li.innerHTML = `
            <div class="comment-meta">
                <span class="comment-author">${escapeHtml(emailToName(comment.author_email))}</span>
                <span class="comment-date">${formatDate(comment.created_at)}</span>
            </div>
            <p class="comment-content">${escapeHtml(comment.content)}</p>
            ${isOwner ? `
                <div class="comment-actions">
                    <button type="button" class="btn-text comment-edit-btn">수정</button>
                    <button type="button" class="btn-text comment-delete-btn">삭제</button>
                </div>
            ` : ''}
        `;

        if (isOwner) {
            li.querySelector('.comment-edit-btn').addEventListener('click', () => {
                startCommentEdit(li, comment, postId, session);
            });
            li.querySelector('.comment-delete-btn').addEventListener('click', async () => {
                if (!confirm('댓글을 삭제하시겠습니까?')) return;
                const { error: deleteError } = await supabaseClient
                    .from('comments')
                    .delete()
                    .eq('id', comment.id);

                if (deleteError) {
                    alert('삭제에 실패했습니다: ' + deleteError.message);
                    return;
                }
                await loadComments(postId, session);
            });
        }

        list.appendChild(li);
    });
}

function startCommentEdit(li, comment, postId, session) {
    const contentP = li.querySelector('.comment-content');
    const actions = li.querySelector('.comment-actions');

    const textarea = document.createElement('textarea');
    textarea.value = comment.content;
    textarea.rows = 3;
    textarea.style.width = '100%';

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'btn-text';
    saveBtn.textContent = '저장';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn-text';
    cancelBtn.textContent = '취소';

    contentP.replaceWith(textarea);
    actions.innerHTML = '';
    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);

    cancelBtn.addEventListener('click', () => loadComments(postId, session));

    saveBtn.addEventListener('click', async () => {
        const newContent = textarea.value.trim();
        if (!newContent) return;

        const { error } = await supabaseClient
            .from('comments')
            .update({ content: newContent })
            .eq('id', comment.id);

        if (error) {
            alert('수정에 실패했습니다: ' + error.message);
            return;
        }
        await loadComments(postId, session);
    });
}

function initCommentForm(postId, session) {
    const form = document.getElementById('comment-form');
    if (!form) return;

    if (!session) {
        form.innerHTML = '<p>댓글을 작성하려면 <a href="../login.html">로그인</a>이 필요합니다.</p>';
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const input = document.getElementById('comment-input');
        const content = input.value.trim();
        if (!content) return;

        const { error } = await supabaseClient
            .from('comments')
            .insert({
                post_id: postId,
                content,
                author_id: session.user.id,
                author_email: session.user.email,
            });

        if (error) {
            alert('댓글 등록에 실패했습니다: ' + error.message);
            return;
        }

        input.value = '';
        await loadComments(postId, session);
    });
}

// ==========================================================================
// 초기화
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    guardWriteButton();
    guardWritePage();
    loadPostList();
    initSearchForm();
    loadRecentPosts();
    initWritePage();
    initDetailPage();
});
