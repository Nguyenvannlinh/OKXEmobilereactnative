class Payment {
    constructor({
        payment_id = 0,
        order_id = 0,
        payment_method = "",
        payment_status = "pending",
        transaction_code = "",
        amount = 0,
        created_at = null
    } = {}) {
        this.payment_id = payment_id;
        this.order_id = order_id;
        this.payment_method = payment_method;
        this.payment_status = payment_status;
        this.transaction_code = transaction_code;
        this.amount = amount;
        this.created_at = created_at;
    }
}

export default Payment;