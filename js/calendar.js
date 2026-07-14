/**
 * calendar.js (세 가지 문제 해결 반영본)
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

    // 달력 렌더링 함수
    function renderCalendar() {
        if (!calendarContainer || !monthYearDisplay) return;

        // 실제 현재 날짜 객체 생성 (실제 시간 반영)
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // 0 ~ 11
        const todayDate = now.getDate();
        
        // [문제 2 해결] 고정 문구가 아닌 실제 날짜를 계산하여 표시 (예: 2026년 7월)
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

        // 시작 요일 및 총 일수 계산
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // 빈 칸 생성
        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement('div');
            calendarContainer.appendChild(emptyDiv);
        }

        // 안전하게 공부 기록 데이터 가져오기 (없으면 빈 객체)
        let records = {};
        if (window.StudyRecords && typeof window.StudyRecords.getAllRecords === 'function') {
            records = window.StudyRecords.getAllRecords();
        }

        // 날짜 칸 동적 생성
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
            
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            
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

        // 통계 인터페이스 업데이트 호출
        updateTopStats(year, month, records);
    }

    // 상단 통계 박스 업데이트 예외 처리 강화
    function updateTopStats(year, month, records) {
        const statAvg = document.getElementById('stat-avg');
        const statYesterday = document.getElementById('stat-yesterday');
        const statStreak = document.getElementById('stat-streak');

        if (!statAvg || !statYesterday || !statStreak) return;

        // 평균 달성률
        let totalPercent = 0;
        let count = 0;
        const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
        
        Object.keys(records).forEach(dateKey => {
            if (dateKey.startsWith(prefix)) {
                totalPercent += records[dateKey].percent;
                count++;
            }
        });
        statAvg.textContent = count > 0 ? `${Math.round(totalPercent / count)}%` : '-';

        // 어제 달성률
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
        
        if (records[yKey]) {
            statYesterday.textContent = `${records[yKey].grade}(${records[yKey].percent}%)`;
        } else {
            statYesterday.textContent = '-';
        }

        // 연속 성취도 일수 (A 이상 기준)
        let streak = 0;
        let checkDate = new Date();
        let safetyCounter = 0; // 무한 루프 방지 안전장치
        
        while (safetyCounter < 100) {
            safetyCounter++;
            const cKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
            const record = records[cKey];
            
            if (record && ['SS', 'S', 'A'].includes(record.grade)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                if (streak === 0 && cKey === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`) {
                    checkDate.setDate(checkDate.getDate() - 1);
                    continue;
                }
                break;
            }
        }
        statStreak.textContent = streak >= 2 ? `${streak}일` : '-일';
    }

    function openStudyModal() {
        if (!studyModal) return;
        inputHours.value = '';
        inputMinutes.value = '';
        errorText.classList.add('hidden');
        studyModal.classList.remove('hidden');
    }

    function closeStudyModal() {
        if (studyModal) studyModal.classList.add('hidden');
    }

    // 초기화 및 호출 보장 [문제 1 해결]
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderCalendar);
    } else {
        renderCalendar();
    }

    // 모달 이벤트 바인딩
    if (studyModal) {
        studyModal.addEventListener('click', (e) => {
            if (e.target === studyModal) closeStudyModal();
        });
    }

    if (btnSaveTime) {
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

            if (window.StudyRecords && typeof window.StudyRecords.saveRecord === 'function') {
                const result = window.StudyRecords.saveRecord(selectedDateStr, hours, minutes);
                if (result.success) {
                    closeStudyModal();
                    renderCalendar();
                    if (result.isOver) {
                        if (window.showToast) window.showToast('목표 시간을 초과하여 100%로 기록되었습니다!');
                    } else {
                        if (window.showToast) window.showToast(result.message);
                    }
                } else {
                    if (window.showToast) window.showToast(result.message, true);
                }
            }
        });
    }
})();
