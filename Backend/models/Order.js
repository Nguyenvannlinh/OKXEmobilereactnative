class Order {
    constructor({
        order_id = 0,
        listing_id = 0,
        buyer_id = 0,
        total_amount = 0,
        payment_status = "pending",
        delivery_status = "pending",
        created_at = null
    } = {}) {
        this.order_id = order_id;
        this.listing_id = listing_id;
        this.buyer_id = buyer_id;
        this.total_amount = total_amount;
        this.payment_status = payment_status;
        this.delivery_status = delivery_status;
        this.created_at = created_at;
    }
}

export default Order;
