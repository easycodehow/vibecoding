// Supabase 클라이언트 초기화
// anon key는 RLS(행 수준 보안) 정책으로 보호되므로 공개되어도 안전함
const SUPABASE_URL = 'https://uwblesyqopvonxwxwzfj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3Ymxlc3lxb3B2b254d3h3emZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NTQ4MjMsImV4cCI6MjA5OTMzMDgyM30.ECcnb-Z6H34JaIPJKNnLA2Xy6QkDO355N3QgeZEkV_g';

// 세션을 localStorage 대신 sessionStorage에 저장 -> 탭/창을 닫으면 로그아웃되고,
// 같은 탭에서 새로고침하거나 페이지를 이동할 때는 로그인 상태가 유지됨
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: window.sessionStorage,
    },
});
