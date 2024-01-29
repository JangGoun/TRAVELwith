// MapService.java
package com.example.demo.service.airandhotel;

import com.example.demo.domain.airandhotel.HotelDetail;
import com.google.maps.GeoApiContext;
import com.google.maps.PlacesApi;
import com.google.maps.model.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class MapService {

    private String apiKey = "AIzaSyB5A_UjhhMLW0d4nCSCIWucmR4io9msPy0";

    public List<HotelDetail> findHotels(String place) {
        try {
            GeoApiContext context = new GeoApiContext.Builder().apiKey(apiKey).build();
            List<HotelDetail> hotelDetails = new ArrayList<>();
            PlacesSearchResponse response = PlacesApi.textSearchQuery(context, place + " lodging")
                    .type(PlaceType.LODGING)
                    .radius(800)
                    .language("ko")
                    .await();

            for (PlacesSearchResult result : response.results) {
                hotelDetails.add(convertToHotelDetail(result));
            }

            return hotelDetails;

        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>(); // 에러 시 빈 리스트 반환
        }
    }

    private HotelDetail convertToHotelDetail(PlacesSearchResult placesSearchResult) {
        HotelDetail hotelDetail = HotelDetail.fromPlacesSearchResult(placesSearchResult);
        hotelDetail.setPlaceId(placesSearchResult.placeId);  // 플레이스 ID 설정
        return hotelDetail;
    }





    // 다른 메서드들도 필요에 따라 추가 가능
}
