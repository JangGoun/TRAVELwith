
let map;
let markers = [];

async function searchHotels(query) {
    try {
        // 호텔 목록을 가져오는 서버 통신 코드
        const response = await fetch(`/api/hotel/service?query=${query}`);
        const hotels = await response.json();

        updateMapMarkers(hotels);
        updateHotelList(hotels);
    } catch (error) {
        console.error("Error fetching hotels:", error);
    }
}

function updateMapMarkers(hotels) {
    // 마커들을 초기화
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    // 호텔 목록이 비어있는 경우 처리
    if (!hotels || hotels.length === 0) {
        return;
    }

    // 마커 및 정보 창 생성
    const infoWindow = new google.maps.InfoWindow();

    // 호텔들의 위치에 마커를 추가
    hotels.forEach(hotel => {
        // hotel.latitude와 hotel.longitude가 정의되어 있을 경우에만 마커 추가
        if (hotel.latitude && hotel.longitude) {
            const marker = new google.maps.Marker({
                position: {lat: hotel.latitude, lng: hotel.longitude},
                map: map,
                title: hotel.name,
            });

            // 마커 클릭 시 정보 창 열기
            marker.addListener('click', () => {
                const roundedRating = Math.round(hotel.rating * 100) / 100;
                const content = `<strong>${hotel.name}</strong><br>⭐: ${roundedRating}`;
                infoWindow.setContent(content);
                infoWindow.open(map, marker);
            });

            markers.push(marker);
        }
    });
}


function updateHotelList(hotels) {
    // 호텔 목록을 초기화
    $("#hotelList").empty();

    // 호텔 목록에 각 호텔의 정보를 추가
    hotels.forEach(hotel => {
        const roundedRating = Math.round(hotel.rating * 100) / 100;

        const card = `
            <div class="card hotel-card data-hotel-id=${hotel.placeId}" data-hotel-place-id="${hotel.placeId}">
                <img src="${hotel.imageUrl}" class="card-img-top" alt="Hotel Image">
                <div class="card-body">
                   <div class="card-body">
                    <h5 class="card-title">
                        <!-- 호텔 이름 클릭 시 모달 열기 -->
                        <a href="#" class="hotel-link" data-bs-toggle="modal" data-bs-target="#hotelModal" data-hotel-name="${hotel.placeId}">
                            ${hotel.name}
                        </a>
                    </h5>
                    <p class="card-text text-start">${hotel.formattedAddress}</p>
                    <p class="card-text text-start">⭐ ${roundedRating}</p>
                </div>
            </div>
        `;
        $("#hotelList").append(card);
    });

    $('.hotel-link').on('click', function () {
        const placeId = $(this).data('hotel-name');
        showHotelDetailsModal(placeId);
    });

    function showHotelDetailsModal(placeId) {
        console.log(placeId)
        $.ajax({
            url: `/api/hotel/service/${placeId}`,
            success: function (data) {
                showHotelDetailsModalContent(data);
                console.log(data)
            },
            error: function (err) {
                console.error(err);
            }
        });
    }
}


// 새로운 함수 추가
function showHotelDetailsModalContent(data) {
    // 여기서 필요한 서버 통신 등을 통해 해당 호텔의 상세 정보를 가져와서 모달에 표시
    console.log(data)
    const modalBody = document.getElementById("hotelModalBody");
    modalBody.innerHTML =
        `<img src="${data.imageUrl}" style="display: block; margin: 0 auto; max-width: 100%; max-height: 100%;"/><hr>
             <span><b>이름</b></span><h5>${data.name}</h5><hr>
             <span><b>주소</b></span><div>${data.formattedAddress}</div><hr>
             <span><b>평점</b></span><div>⭐ ${data.rating.toFixed(1)}</div><hr>
             <span><b>번호</b></span><div>${data.phoneNumber}</div><hr>
             <span><b>국제전화</b></span><div>${data.internationalPhoneNumber}</div><hr>
             <a href="${data.websiteUri}" target="_blank"> 홈페이지 바로가기 </a> <p style="font-size: 10px; color: red;">없을 수도 있습니다.</p><hr>
             <span><b>전체리뷰</b></span><div>${data.userRatingCount}</div><hr>`;
    modalBody.innerHTML += `<h5><b>호텔추가사진</b></h5>`;
    for (var photo of data.photos) {
        modalBody.innerHTML +=
            `<div class="mySlides2">
                    <img src="${photo}" style="display: block; margin: 0 auto; max-width: 100%; max-height: 100%;"/>
                 </div>`
    }
    modalBody.innerHTML += `<hr><h5><b>사용자 리뷰 및 개인평점</b></h5>`;
    for (var review of data.review) {
        // 원래의 날짜 문자열을 Date 객체로 변환
        var reviewDate = new Date(review.time);

        // 날짜 및 시간을 원하는 형식으로 포맷
        var formattedDate = reviewDate.getFullYear() + '년 ' +
            ('0' + (reviewDate.getMonth() + 1)).slice(-2) + '월 ' +
            ('0' + reviewDate.getDate()).slice(-2) + '일 ' +
            ('0' + reviewDate.getHours()).slice(-2) + '시 ' +
            ('0' + reviewDate.getMinutes()).slice(-2) + '분';

        modalBody.innerHTML +=
            `<div class="mySlides">
                     <div><b>${review.authorName} ⭐ ${review.rating.toFixed(1)}</b></div>
                     <div>${review.text}</div>
                     <div><b>작성일: ${formattedDate}</b></div>
                 </div>`
    }

    // 슬라이드쇼를 시작하는 함수
    var slideIndex = 0;
    showSlides();

    function showSlides() {
        var slides = document.getElementsByClassName("mySlides");
        for (var i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }
        slideIndex++;
        if (slideIndex > slides.length) {
            slideIndex = 1;
        }
        slides[slideIndex - 1].style.display = "block";
        setTimeout(showSlides, 15000)
    }

    // 슬라이드쇼를 시작하는 함수
    var slideIndex2 = 0;
    showSlides2();

    function showSlides2() {
        var slides = document.getElementsByClassName("mySlides2");
        for (var i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }
        slideIndex2++;
        if (slideIndex2 > slides.length) {
            slideIndex2 = 1;
        }
        slides[slideIndex2 - 1].style.display = "block";
        setTimeout(showSlides2, 7000);
    }


}


function moveMapToCity(place) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({address: place.name}, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            map.setZoom(14); // 이동한 지도의 줌 레벨 설정
        } else {
            console.error("Geocode was not successful for the following reason:", status);
        }
    });
}

function handleMapClick(event) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({location: event.latLng}, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
            const place = results[0];
            map.setCenter(place.geometry.location);
            map.setZoom(16);
            const input = document.getElementById("searchInput");

            // 'place.name'이 없는 경우 'place.formatted_address'를 사용
            const query = place.name || place.formatted_address;

            input.value = query;

            // 검색된 장소로 호텔 검색 실행
            searchHotels(query);
        } else {
            console.error("Geocode was not successful for the following reason:", status);
        }
    });
}
