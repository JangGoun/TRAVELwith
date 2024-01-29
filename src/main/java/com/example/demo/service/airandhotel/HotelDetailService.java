package com.example.demo.service.airandhotel;

import com.example.demo.domain.airandhotel.HotelDetail;
import com.google.maps.GeoApiContext;
import com.google.maps.PlacesApi;
import com.google.maps.model.*;
import org.springframework.stereotype.Service;

@Service
public class HotelDetailService {

    private String apiKey = "AIzaSyB5A_UjhhMLW0d4nCSCIWucmR4io9msPy0";

    public HotelDetail getHotelDetail(String placeId) {
        try {
            GeoApiContext context = new GeoApiContext.Builder().apiKey(apiKey).build();
            PlaceDetails response = PlacesApi.placeDetails(context, placeId)
                    .language("ko")
                    .await();

            if (response != null) {
                return convertToHotelDetail(response);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return null; // 에러 시 null 반환
    }

    private HotelDetail convertToHotelDetail(PlaceDetails placeDetails) {
        return HotelDetail.fromPlaceDetails(placeDetails);
    }

    // 다른 메서드들도 필요에 따라 추가 가능
}
