document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('noticeTable')) {
        loadNotices();
    }
    if (document.getElementById('classification')) {
        setDateFilter('today'); // 기본값을 오늘로
    }
    setupToggleMenus();
    // 출고.html 페이지 로드 시 기본적으로 5개의 빈 행 추가
    initializeTableWithEmptyRows();
});

/* 입고, 출고.html 페이지 로드 시 기본적으로 5개의 빈 행 추가하는 함수 */
function initializeTableWithEmptyRows() {
    const resultTableBody = document.querySelector('.IO-table tbody');

    for (let i = 0; i < 5; i++) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
        `;
        resultTableBody.appendChild(emptyRow);
    }
}

/* 사이드바 시간 설정*/
function updateTime() {
    const now = new Date();
    const options = { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const koreaTime = now.toLocaleString('ko-KR', options);
    document.getElementById('currentTime').textContent = koreaTime;
}

setInterval(updateTime, 1000); // 1초마다 시간 표시
updateTime(); //
/* 사이드바 시간 설정*/

// '추가' 버튼 눌렀을 때
function openNoticeForm() {
    document.getElementById('noticeModal').style.display = 'block';
}

function closeNoticeForm() {
    document.getElementById('noticeModal').style.display = 'none';
}

// 사이드바 토글
function setupToggleMenus() {
    const toggleTitles = document.querySelectorAll('.toggle-title');
    toggleTitles.forEach(title => {
        title.addEventListener('click', () => {
            const content = title.querySelector('.toggle-content');
            const currentlyActive = document.querySelector('.toggle-title.active');
            if (currentlyActive && currentlyActive !== title) {
                currentlyActive.classList.remove('active');
                currentlyActive.querySelector('.toggle-content').classList.remove('show');
            }
            title.classList.toggle('active');
            content.classList.toggle('show');
        });
    });
}

document.getElementById('noticeForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    fetch('/api/notices', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title, content: content }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        closeNoticeForm();
        loadNotices();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

function loadNotices() {
    fetch('/api/notices')
    .then(response => response.json())
    .then(data => {
        const noticeTableBody = document.getElementById('noticeTable').querySelector('tbody');
        noticeTableBody.innerHTML = '';
        data.forEach((notice, index) => {
            const row = document.createElement('tr');
            row.classList.add('clickable-row');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${notice.title}<button onclick="deleteNotice(${notice.id})">삭제</button></td>
            `;
            row.addEventListener('click', () => showNoticeDetails(notice));
            noticeTableBody.appendChild(row);
        });
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}


function deleteNotice(id) {
    if (confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
        fetch(`/api/notices/${id}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                loadNotices();  // 공지사항 목록을 새로고침
                alert('공지사항이 삭제되었습니다');
            } else {
                alert('삭제 중 문제가 발생했습니다');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
}


function showNoticeDetails(notice) {
    document.getElementById('detailTitle').innerText = notice.title;
    document.getElementById('detailContent').innerText = notice.content;
}

window.onclick = function(event) {
    const modal = document.getElementById('noticeModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function search() {
    const centerCode = document.getElementById('centerCode').value;
    const clientCompanyName = document.getElementById('clientCompanyName').value;
    const deletionStatus = document.getElementById('deletionStatus').value;
    console.log(`검색: 센터코드=${centerCode}, 고객사명=${clientCompanyName}, 공정=${deletionStatus}`);
}

function reset() {
    document.getElementById('centerCode').value = '';
    document.getElementById('clientCompanyName').value = '';
    document.getElementById('deletionStatus').value = '';
    loadNotices();
}


// 반출.html
function setDateFilter(period) {
    const today = new Date();
    let startDate, endDate;
    
    switch (period) {
        case 'today':
            startDate = today;
            endDate = today;
            break;
        case '1week':
            startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
            endDate = today;
            break;
        case '1month':
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            endDate = today;
            break;
        case '3months':
            startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
            endDate = today;
            break;
        case '6months':
            startDate = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
            endDate = today;
            break;
        case '1year':
            startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
            endDate = today;
            break;
        default:
            startDate = today;
            endDate = today;
    }

    document.getElementById('startDate').valueAsDate = startDate;
    document.getElementById('endDate').valueAsDate = endDate;
}

function searchByDate() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    console.log(`기간 검색: 시작일=${startDate}, 종료일=${endDate}`);
    // 날짜 필터 검색 로직을 여기에 추가
}

// 반출 행 추가 and 행 삭제
// 반출.html 행 추가 기능
function addRow() {
    const table = document.getElementById('detailCapaTable').getElementsByTagName('tbody')[0];
    const rowCount = table.rows.length;
    const newRow = table.insertRow(rowCount);

    // 새로운 행에 셀 추가
    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);
    const cell4 = newRow.insertCell(3);
    const cell5 = newRow.insertCell(4);
    const cell6 = newRow.insertCell(5);
    const cell7 = newRow.insertCell(6);
    const cell8 = newRow.insertCell(7);
    const cell9 = newRow.insertCell(8);
    const cell10 = newRow.insertCell(9);
    const cell11 = newRow.insertCell(10);
    const cell12 = newRow.insertCell(11);
    const cell13 = newRow.insertCell(12);
    const cell14 = newRow.insertCell(13);
    const cell15 = newRow.insertCell(14);
    const cell16 = newRow.insertCell(15);
    const cell17 = newRow.insertCell(16);

    // 각 셀에 내용 추가
    cell1.innerHTML = '<input type="checkbox">';
    cell2.innerHTML = rowCount + 1; // No column
    cell3.innerHTML = '<input type="text">';
    cell4.innerHTML = '<input type="text">';
    cell5.innerHTML = '<input type="text">';
    cell6.innerHTML = '<input type="checkbox">';
    cell7.innerHTML = '<input type="checkbox">';
    cell8.innerHTML = '<input type="checkbox">';
    cell9.innerHTML = '<input type="checkbox">';
    cell10.innerHTML = '<input type="checkbox">';
    cell11.innerHTML = '<input type="checkbox">';
    cell12.innerHTML = '<input type="checkbox">';
    cell13.innerHTML = '<input type="time">';
    cell14.innerHTML = '<input type="time">';
    cell15.innerHTML = '<input type="number">';
    cell16.innerHTML = '<input type="text">';
    cell17.innerHTML = '<input type="checkbox">';
}

// 반출.html 행 삭제 기능
function deleteRow() {
    const table = document.getElementById('detailCapaTable').getElementsByTagName('tbody')[0];
    const rowCount = table.rows.length;

    // 선택된 행 찾기
    for (let i = rowCount - 1; i >= 0; i--) {
        const row = table.rows[i];
        const checkbox = row.cells[0].getElementsByTagName('input')[0];
        if (checkbox && checkbox.checked) {
            table.deleteRow(i);
        }
    }

    // No column 다시 번호 매기기
    for (let i = 0; i < table.rows.length; i++) {
        table.rows[i].cells[1].innerHTML = i + 1;
    }
}


// 출고.html 전용 search 함수
function searchOutbound() {
    const resultTableBody = document.querySelector('.IO-table tbody');
    
    // 기존의 행을 모두 제거합니다.
    resultTableBody.innerHTML = ''; // 기존 행 초기화

    // 2초 후에 dummyData를 추가하는 setTimeout 설정
    setTimeout(() => {
        // 임의의 데이터 추가
        const dummyData = [
            { no: 1, code: '300000077(이천2 F/C)', category: '전산재고부족3', description: '설명1', phone: '010-1234-5678', fax: '02-1234-5678' },
            { no: 2, code: '300000077(이천2 F/C)', category: '실물재고부족', description: '설명2', phone: '010-2345-6789', fax: '02-2345-6789' },
            { no: 3, code: '300000077(이천2 F/C)', category: '파손 및 오염', description: '설명3', phone: '010-3456-7890', fax: '02-3456-7890' },
        ];

        dummyData.forEach(item => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${item.no}</td>
                <td>${item.code}</td>
                <td>${item.category}</td>
                <td>${item.description}</td>
                <td>${item.phone}</td>
                <td>${item.fax}</td>
            `;
            resultTableBody.appendChild(newRow);
        });

        // 조회 결과가 5개 미만일 경우 빈 행 추가
        const rowCount = dummyData.length;
        if (rowCount < 5) {
            for (let i = 0; i < 5 - rowCount; i++) {
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = `
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                `;
                resultTableBody.appendChild(emptyRow);
            }
        }

        console.log('출고 조회 결과: 임의의 데이터가 추가되었습니다.');
    }, 2000); // 2000 밀리초 (2초) 후에 실행
}
