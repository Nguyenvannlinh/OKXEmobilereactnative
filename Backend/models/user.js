class User {
    constructor({
        user_id = 0,
        username = "",
        email = "",
        password_hash = "",
        phone_number = "",
        full_name = "",
        avatar_url = "",
        is_verified = false,
        created_at = null
    } = {}) {
        this.user_id = user_id;
        this.username = username;
        this.email = email;
        this.password_hash = password_hash;
        this.phone_number = phone_number;
        this.full_name = full_name;
        this.avatar_url = avatar_url;
        this.is_verified = is_verified;
        this.created_at = created_at;
    }
}
export default User;