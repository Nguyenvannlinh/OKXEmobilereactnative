class Role {
    constructor({
        role_id = 0,
        role_name = ""
    } = {}) {
        this.role_id = role_id;
        this.role_name = role_name;
    }
}
export default Role;