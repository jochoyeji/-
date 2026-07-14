/**
 * calendar.js (3단계 수정 반영)
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

    // 1. 캘린더 렌더링 및 성취도 등급 표시
    function renderCalendar() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const todayDate = now.getDate();
        
        monthYearDisplay.textContent = `${year}년 ${month + 1}월`;
        calendarContainer.innerHTML = '';

        const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
        daysOfWeek.forEach(day => {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'cal-header-day';
            dayDiv.textContent = day;
            calendarContainer.appendChild(dayDiv);
        });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement('div');
            calendarContainer.appendChild(emptyDiv);
        }

        // 저장된 기록 가져오기
        const records = window.StudyRecords ? window.StudyRecords.getAllRecords() : {};

        for (let i = 1; i <= daysInMonth; i++) {
            const dateDiv = document.createElement('div');
            dateDiv.className = 'cal-day';
            
            if (i === todayDate) {
                dateDiv.classList.add('today');
            }

            const dateSpan = document.createElement('span');
            dateSpan.textContent = i;
            
            const gradeSpan = document.createElement('span');
            gradeSpan.className = 'grade-display';
            
            // 날짜 문자열 키 생성 (YYYY-MM-DD)
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            
            // 기록이 있다면 알파벳 등급만 표시
            if (records[dateStr] && records[dateStr].grade) {
                gradeSpan.textContent = records[dateStr].grade;
            }

            dateDiv.appendChild(dateSpan);
            dateDiv.appendChild(gradeSpan);

            dateDiv.addEventListener('click', () => {
                selectedDateStr = dateStr;
                openStudyModal();
            });

            calendarContainer.appendChild(dateDiv);
        }

        // 상단 통계 정보 업데이트
        updateTopStats(year, month);
    }

    // 2. 상단 통계 박스 업데이트 (평균 달성률, 어제 달성률, 연속 성취도)
    function updateTopStats(year, month) {
        if (!window.StudyRecords) return;
        const records = window.StudyRecords.getAllRecords();
        
        // --- [1] 평균 달성률 계산 (해당 월 기준) ---
        let totalPercent = 0;
        let count = 0;
        
        Object.keys(records).forEach(dateKey => {
            if (dateKey.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)) {
                totalPercent += records[dateKey].percent;
                count++;
            }
        });
        const avgPercent = count > 0 ? Math.round(totalPercent / count) : 0;
        document.getElementById('stat-avg').textContent = count > 0 ? `${avgPercent}%` : '-';

        // --- [2] 어제 달성률 계산 ---
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
        
        if (records[yKey]) {
            document.getElementById('stat-yesterday').textContent = `${records[yKey].grade}(${records[yKey].percent}%)`;
        } else {
            document.getElementById('stat-yesterday').textContent = '-';
        }

        // --- [3] 연속 성취도 일수 계산 (A이상: SS, S, A 기준) ---
        let streak = 0;
        let checkDate = new Date(); // 오늘부터 역산 시작
        
        while (true) {
            const cKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
            const record = records[cKey];
            
            if (record && ['SS', 'S', 'A'].includes(record.grade)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                // 오늘 기록이 없으면 어제부터 다시 연속성을 검사하기 위해 하루 전을 한 번 더 확인함
                if (streak === 0 && cKey === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`) {
                    checkDate.setDate(checkDate.getDate() - 1);
                    continue;
                }
                break;
            }
        }
        // 연속 성취도는 이틀(2일) 이상 달성했을 때만 표시하고 아니면 -일 처리
        document.getElementById('stat-streak').textContent = streak >= 2 ? `${streak}일` : '-일';
    }

    function openStudyModal() {
        inputHours.value = '';
        inputMinutes.value = '';
        errorText.classList.add('hidden');
        studyModal.classList.remove('hidden');
    }

    function closeStudyModal() {
        studyModal.classList.add('hidden');
    }

    studyModal.addEventListener('click', (e) => {
        if (e.target === studyModal) closeStudyModal();
    });

    // 3. 저장 및 예외 메시지 연동
    btnSaveTime.addEventListener('click', () => {
        const hStr = inputHours.value.trim();
        const mStr = inputMinutes.value.trim();

        if (hStr === '' && mStr === '') {
            errorText.classList.remove('hidden');
            return;
        }

        const hours = hStr === '' ? 0 : Number(hStr);
        const minutes = mStr === '' ? 0 : Number(mStr);

        if (isNaN(hours) || isNaN(minutes) || hours < 0 || minutes < 0) {
            errorText.classList.remove('hidden');
            return;
        }

        errorText.classList.add('hidden');

        // 실제 records.js를 통한 계산 및 저장 진행
        const result = window.StudyRecords.saveRecord(selectedDateStr, hours, minutes);
        
        if (result.success) {
            closeStudyModal();
            renderCalendar(); // 등급 및 상단 통계 즉시 갱신
            
            // 실제 공부 시간이 목표 시간을 크게 초과했을 때의 커스텀 알림 처리 (기본 alert 대신 toast 활용 확대)
            if (result.isOver) {
                window.showToast('목표 시간을 초과하여 100%로 기록되었습니다!');
            } else {
                window.showToast(result.message); // "저장되었습니다" 3초간 노출
            }
        } else {
            // 저장 실패 혹은 공부가능시간 0분 요류 메시지 토스트 처리
            window.showToast(result.message, true);
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        renderCalendar();
    });
})();
