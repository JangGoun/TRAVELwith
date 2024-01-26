let currentPage = 1;
let totalPages;
function getEventInformation(targetPage) {
    const countryCode = document.getElementById('countryCode').value;
    const classificationName = document.getElementById('classification').value;
    const apiUrl = `http://localhost:8080/countryinfo/list?countryCode=${countryCode}&page=${targetPage}&classificationName=${classificationName}`;
    console.log(apiUrl)

    if (countryCode === "선택하세요") {
        alert("국가 코드를 선택하세요.");
        return;
    }

    // API 요청
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            list(data)

            // 이벤트 목록과 페이지를 로컬 스토리지에 저장
            localStorage.setItem('data', JSON.stringify(data));

            // 1시간 후에 세션 스토리지에서 'data' 키에 해당하는 데이터 제거
            setTimeout(() => {
                localStorage.removeItem('data');
            }, 3600000); // 1시간

        })
        .catch(error => {
            console.error('데이터를 가져오는 중 오류 발생:', error);
        });

} // end getEventInformation

function list(data) {
    const embedded = data._embedded;
    const events = embedded.events;
    totalPages = data.page.totalPages;


    const resultElement = document.getElementById('result');
    let htmlString = `<div class="card-container row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">`
    for (var event of events) {
        for (var venue of event._embedded.venues) {
            var imageUrl = event.images.find(image => image.url.includes('TABLET_LANDSCAPE_3_2'));
            const eventId = event.id;
            htmlString += `
                        <div class="col event-card" onclick="redirectToLoadInfo(this)">
                            <form class="getDetailEvent" action="http://localhost:8080/countryinfo/info">
                                <input class="eventId" type="hidden" name="eventId" value="${eventId}">
                            </form>
                            <div class="card h-100">
                                <img src="${imageUrl ? imageUrl.url : event.images[0].url}" width="455" height="350" style="max-width: 100%; max-height: 100%;">
                                <div class="card-body">
                                    <p><strong>이벤트 제목:</strong> ${event.name}</p>
                                    <p><strong>장소 이름:</strong> ${venue.name}</p>
                                    <p><strong>도시 이름:</strong> ${venue.city.name}</p>
                                    <p><strong>현지 시간:</strong> ${event.dates.start.localDate} ${event.dates.start.localTime  ? event.dates.start.localTime : ''}</p>
                                </div>
                            </div>
                        </div>
            `;
        }
    }
    htmlString += `</div>`;
    resultElement.innerHTML = htmlString;

    renderPagination(totalPages);
} // end list()

function renderPagination() {
    const pagingElement = document.getElementById('paging');
    const pagesPerGroup = 10;

    let groupNumber = Math.ceil(currentPage / pagesPerGroup);
    let startPage = (groupNumber - 1) * pagesPerGroup + 1;
    let endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);

    let pagingHtml = `<br> <nav aria-label="페이지 네비게이션" style="display: flex; justify-content: center;"><ul class="pagination">`;
    // 이전 버튼
    pagingHtml += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${startPage - 1})"><<</a></li>`;
    // 페이지 숫자
    for (let i = startPage; i <= endPage; i++) {
        pagingHtml += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${i})">${i}</a></li>`;
    }
    // 다음 버튼
    pagingHtml += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${endPage + 1})">>></a></li>`;

    pagingHtml += `</ul></nav>`;
    pagingElement.innerHTML = pagingHtml;

} // end renderPagination()

function changePage(targetPage) {
    if (targetPage >= 1 && targetPage <= totalPages) {
        currentPage = targetPage;
        getEventInformation(targetPage - 1)
    }
} // end changePage

// 페이지 로드 시 이전에 저장한 데이터 불러오기
window.onload = function () {
    const storedEventList = localStorage.getItem('data');
    if (storedEventList != null) {
        const data = JSON.parse(storedEventList);
        list(data);
    }
    // 탭을 닫을 때 발생하는 이벤트
    window.addEventListener('beforeunload', function () {
        // 로컬 스토리지에서 'data' 키에 해당하는 데이터 제거
        localStorage.removeItem('data');
    });
};

function redirectToLoadInfo(clickedElement) {
    //클릭된 요소에서 .eventId 클래스를 가진 하위 요소를 찾기
    const eventIdInput = clickedElement.querySelector('.eventId');
    //이벤트 ID 값 확인
    const eventId = eventIdInput.value;
    if (!eventId) {
        console.error('이벤트 ID를 찾을 수 없거나 비어 있습니다.');
        return;
    }
    // 콘솔에 이벤트 ID 출력

    // .getDetailEvent 클래스를 가진 하위 폼 찾기
    const detailEventForm = clickedElement.querySelector('.getDetailEvent');

    // 폼이 존재하는지 확인
    if (!detailEventForm) {
        console.error('.getDetailEvent 클래스를 가진 폼을 찾을 수 없습니다.');
        return;
    }
    getEventInformation(currentPage - 1);

    // 폼 서브밋
    detailEventForm.submit();
}