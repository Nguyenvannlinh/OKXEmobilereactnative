class Model {
    constructor({
        model_id = 0,
        manufacturer_id = 0,
        name = "",
        year_introduced = null
    } = {}) {
        this.model_id = model_id;
        this.manufacturer_id = manufacturer_id;
        this.name = name;
        this.year_introduced = year_introduced;
    }
}
export default Model;