class UserRole {
    constructor({
        user_id = 0,
        role_id = 0
    } = {}) {
        this.user_id = user_id;
        this.role_id = role_id;
    }
}
export default UserRole;