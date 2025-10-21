class Dealer {
    constructor({
        dealer_id = 0,
        user_id = 0,
        dealer_name = "",
        address = "",
        business_license = "",
        is_verified = false
    } = {}) {
        this.dealer_id = dealer_id;
        this.user_id = user_id;
        this.dealer_name = dealer_name;
        this.address = address;
        this.business_license = business_license;
        this.is_verified = is_verified;
    }
}
export default Dealer;