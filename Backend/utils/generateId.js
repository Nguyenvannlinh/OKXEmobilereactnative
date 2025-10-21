export const generateCustomerId = () => {
    const random = Math.floor(Math.random() * 90) + 10;
    return `CUS${Date.now()}${random}`;
  };
  
  // Hàm tạo ID hóa đơn
  export const generateInvoiceId = () => {
    const random = Math.floor(Math.random() * 90) + 10;
    return `INV${Date.now()}${random}`;
  };
  
  // Hàm tạo ID chi tiết hóa đơn
  export const generateDetailInvoiceId = () => {
    const random = Math.floor(Math.random() * 900) + 100;
    return `DINV${Date.now()}${random}`;
  };
  
  // Hàm tạo ID sản phẩm
  export const generateProductId = () => {
    const random = Math.floor(Math.random() * 90) + 10;
    return `SP${Date.now()}${random}`;
  };