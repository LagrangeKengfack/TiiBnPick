package com.polytechnique.tiibntick.dtos.address;

import com.polytechnique.tiibntick.models.enums.address.AddressType;
import lombok.Data;

@Data
public class AddressDTO {
    private String street;
    private String city;
    private String district;
    private String country;
    private String description;
    private AddressType type;
    private Double latitude;
    private Double longitude;
}
