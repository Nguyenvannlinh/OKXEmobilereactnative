class ReviewRating {
    constructor({
        review_id = 0,
        reviewer_id = 0,
        reviewed_user_id = 0,
        listing_id = 0,
        rating = 0,
        comment = "",
        created_at = null
    } = {}) {
        this.review_id = review_id;
        this.reviewer_id = reviewer_id;
        this.reviewed_user_id = reviewed_user_id;
        this.listing_id = listing_id;
        this.rating = rating;
        this.comment = comment;
        this.created_at = created_at;
    }
}
export default ReviewRating;