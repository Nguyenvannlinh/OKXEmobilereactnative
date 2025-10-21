class Message {
    constructor({
        message_id = 0,
        sender_id = 0,
        receiver_id = 0,
        listing_id = 0,
        content = "",
        sent_at = null,
        is_read = false
    } = {}) {
        this.message_id = message_id;
        this.sender_id = sender_id;
        this.receiver_id = receiver_id;
        this.listing_id = listing_id;
        this.content = content;
        this.sent_at = sent_at;
        this.is_read = is_read;
    }
}
export default Message;