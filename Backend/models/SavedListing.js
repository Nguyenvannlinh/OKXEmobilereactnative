class SavedListing {
    constructor({
        user_id = 0,
        listing_id = 0,
        saved_at = null
    } = {}) {
        this.user_id = user_id;
        this.listing_id = listing_id;
        this.saved_at = saved_at;
    }
}
export default SavedListing;