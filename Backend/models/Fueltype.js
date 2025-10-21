class FuelType {
    constructor({
        fuel_type_id = 0,
        name = ""
    } = {}) {
        this.fuel_type_id = fuel_type_id;
        this.name = name;
    }
}
export default FuelType;