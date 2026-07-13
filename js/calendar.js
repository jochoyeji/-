/**
 * calendar.js
 * 캘린더 렌더링, 날짜 선택 및 순공 시간 입력 모달 제어를 담당합니다.
 */

(function() {
    const calendarContainer = document.getElementById('calendar-container');
    const monthYearDisplay = document.getElementById('current-month-year');
    
    const studyModal = document.getElementById('study-time-modal');
    const inputHours = document.getElementById('input-hours');
    const inputMinutes = document.getElementById('input-minutes');
    const errorText = document.getElementById('study-time-error');
    const btnSaveTime = document.getElementById('btn-save-time');

    let selectedDateStr = null;

    // 1. 캘린더 렌더링 함수
    function renderCalendar() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // 0 ~ 11
        const todayDate = now.getDate();
        
        // 헤더 텍스트 갱신 (--년 -월)
        monthYearDisplay.textContent = `${year}년 ${month + 1}월`;
        
        // 컨테이너 초기화
        calendarContainer.innerHTML = '';

        // 요일 헤더 생성
        const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
        daysOfWeek.forEach(day => {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'cal-header-day';
            dayDiv.textContent = day;
            calendarContainer.appendChild(dayDiv);
        });

        // 이번 달의 시작 요일 및 총 일수 계산
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // 1일 이전의 빈 칸 생성
        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement('div');
            calendarContainer.appendChild(emptyDiv);
        }

        // 날짜 칸 생성
        for (let i = 1; i <= daysInMonth; i++) {
            const dateDiv = document.createElement('div');
            dateDiv.className = 'cal-day';
            
            // 오늘 날짜 처리
            if (i === todayDate) {
                dateDiv.classList.add('today');
            }

            // 날짜 텍스트
            const dateSpan = document.createElement('span');
            dateSpan.textContent = i;
            
            // 성취도 등급 표시 영역 (3, 4단계에서 데이터 연동 예정)
            const gradeSpan = document.createElement('span');
            gradeSpan.className = 'grade-display';
            gradeSpan.textContent = ''; // 예: 'S', 'A' 등

            dateDiv.appendChild(dateSpan);
            dateDiv.appendChild(gradeSpan);

            // 날짜 클릭 이벤트 -> 모달 오픈
            dateDiv.addEventListener('click', () => {
                selectedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                openStudyModal();
            });

            calendarContainer.appendChild(dateDiv);
        }
    }

    // 2. 모달 제어 함수
    function openStudyModal() {
        // 입력 필드 및 에러 메시지 초기화
        inputHours.value = '';
        inputMinutes.value = '';
        errorText.classList.add('hidden');
        studyModal.classList.remove('hidden');
    }

    function closeStudyModal() {
        studyModal.classList.add('hidden');
    }

    // 모달 배경 클릭 시 닫기
    studyModal.addEventListener('click', (e) => {
        if (e.target === studyModal) {
            closeStudyModal();
        }
    });

    // 3. 완료 버튼 클릭 이벤트 (입력값 검증)
    btnSaveTime.addEventListener('click', () => {
        const hStr = inputHours.value.trim();
        const mStr = inputMinutes.value.trim();

        // 숫자를 입력하지 않은 상태 체크
        if (hStr === '' && mStr === '') {
            errorText.classList.remove('hidden');
            return;
        }

        // 입력값이 비어있으면 0으로 처리, 값이 있으면 숫자로 변환
        const hours = hStr === '' ? 0 : Number(hStr);
        const minutes = mStr === '' ? 0 : Number(mStr);

        // 숫자 외의 다른 문자가 입력되었거나(NaN), 음수인 경우 에러 처리
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || minutes < 0) {
            errorText.classList.remove('hidden');
            return;
        }

        // 에러 숨김
        errorText.classList.add('hidden');

        // TODO: 3단계에서 LocalStorage와 records.js를 통해 실제 저장 로직 및 성취도 계산 연동
        // 임시로 모달을 닫고 성공 메시지 출력
        closeStudyModal();
        if (window.showToast) {
            window.showToast('저장되었습니다'); // 3단계에서 로직 구체화
        }
    });

    // 초기화 실행
    document.addEventListener('DOMContentLoaded', () => {
        renderCalendar();
    });

})();
