class Image {
    constructor({
        image_id = 0,
        listing_id = 0,
        image_url = "",
        is_primary = false
    } = {}) {
        this.image_id = image_id;
        this.listing_id = listing_id;
        this.image_url = image_url;
        this.is_primary = is_primary;
    }
}
export default Image;