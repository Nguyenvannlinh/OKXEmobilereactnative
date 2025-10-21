class BodyType {
    constructor({
        body_type_id = 0,
        name = ""
    } = {}) {
        this.body_type_id = body_type_id;
        this.name = name;
    }
}
export default BodyType;