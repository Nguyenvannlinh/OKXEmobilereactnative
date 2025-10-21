class Listing {
    constructor({
        listing_id = 0,
        user_id = 0,
        title = "",
        description = "",
        price = 0,
        price_negotiable = true,
        odometer = 0,
        manufacturer_id = 0,
        model_id = 0,
        body_type_id = null,
        fuel_type_id = null,
        transmission_id = null,
        year_of_manufacture = null,
        year_of_registration = null,
        province_city = "",
        color = "",
        number_of_seats = null,
        status = "pending",
        view_count = 0,
        created_at = null,
        updated_at = null
    } = {}) {
        this.listing_id = listing_id;
        this.user_id = user_id;
        this.title = title;
        this.description = description;
        this.price = price;
        this.price_negotiable = price_negotiable;
        this.odometer = odometer;
        this.manufacturer_id = manufacturer_id;
        this.model_id = model_id;
        this.body_type_id = body_type_id;
        this.fuel_type_id = fuel_type_id;
        this.transmission_id = transmission_id;
        this.year_of_manufacture = year_of_manufacture;
        this.year_of_registration = year_of_registration;
        this.province_city = province_city;
        this.color = color;
        this.number_of_seats = number_of_seats;
        this.status = status;
        this.view_count = view_count;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}
export default Listing;