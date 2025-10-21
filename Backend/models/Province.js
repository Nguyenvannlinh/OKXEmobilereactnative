class Province {
    constructor({
        province_id = 0,
        name = ""
    } = {}) {
        this.province_id = province_id;
        this.name = name;
    }
}
export default Province;