/**
 * app.js
 * 메인 애플리케이션의 UI 제어, 화면 전환(SPA), 모달 및 토스트 알림을 담당합니다.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 캐싱
    const menuBtn = document.getElementById('btn-menu');
    const menuModal = document.getElementById('menu-modal');
    const closeMenuBtn = document.getElementById('btn-close-menu');
    const menuItems = document.querySelectorAll('.menu-btn');
    const backBtns = document.querySelectorAll('.btn-back');
    const screens = document.querySelectorAll('.screen');
    const toastContainer = document.getElementById('toast-container');

    let toastTimeout;

    // 1. 화면 전환 함수 (SPA)
    function showScreen(screenId) {
        screens.forEach(screen => {
            if (screen.id === screenId) {
                screen.classList.add('active');
            } else {
                screen.classList.remove('active');
            }
        });
        // 화면 이동 시 모달은 항상 닫기
        closeModal();
    }

    // 2. 모달 열기/닫기
    function openModal() {
        menuModal.classList.remove('hidden');
    }

    function closeModal() {
        menuModal.classList.add('hidden');
    }

    // 3. 토스트(알림) UI 함수
    // 외부 파일에서 호출할 수 있도록 window 객체에 할당 (추후 기능 확장을 위함)
    window.showToast = function(message, isError = false) {
        toastContainer.textContent = message;
        toastContainer.className = 'toast'; // 기본 클래스로 초기화
        
        if (isError) {
            toastContainer.classList.add('error');
        }
        
        toastContainer.classList.remove('hidden');

        // 기존 타이머가 있다면 초기화
        if (toastTimeout) {
            clearTimeout(toastTimeout);
        }

        // 3초 후 사라짐
        toastTimeout = setTimeout(() => {
            toastContainer.classList.add('hidden');
        }, 3000);
    };

    // --- 이벤트 리스너 등록 ---

    // 햄버거 메뉴 버튼 클릭
    menuBtn.addEventListener('click', openModal);

    // 모달 닫기 버튼 클릭
    closeMenuBtn.addEventListener('click', closeModal);

    // 모달 배경 클릭 시 닫기
    menuModal.addEventListener('click', (e) => {
        if (e.target === menuModal) {
            closeModal();
        }
    });

    // 모달 내 메뉴 버튼 클릭 시 화면 전환
    menuItems.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetScreenId = e.target.getAttribute('data-target');
            if (targetScreenId) {
                showScreen(targetScreenId);
            }
        });
    });

    // 뒤로가기(<) 버튼 클릭 시 메인 화면(캘린더)으로 복귀
    backBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 설정 화면에서 변경사항이 있을 때의 로직은 추후 settings.js에서 덮어쓰거나 이벤트 추가 예정
            showScreen('screen-main');
        });
    });
});
