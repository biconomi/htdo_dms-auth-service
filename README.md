LẤY DUYẾT TOÁN SỬA CHỮA TRÊN DMS
=================================
Overview
Settlement Invoice API dùng để:

- Lấy dữ liệu RO từ DMS
- Lấy danh sách dịch vụ (Services)
- Lấy danh sách phụ tùng (Parts)
- Lấy thông tin thẻ thành viên
- Tính toán tổng tiền, VAT
- Tính số tiền khách cần thanh toán
- Trả về dữ liệu raw để phục vụ đối soát
------------------------
API yêu cầu header bảo mật nội bộ:
x-internal-key: <your-internal-key> 
Nếu thiếu hoặc sai key → API trả về 401 Token Forbidden.

------------------------
Base URL:
http://192.168.12.66:3001/api

Chỉ được phép truy cập nội bộ không có public ra ngoài nên không thể truy cập bên ngoài.

------------------------
Endpoint
POST /settlementInvoice

------------------------
Request
| Key                            | Required | Description         |
| ------------------------------ | -------- | ------------------- |
| Content-Type: application/json | Yes      | Format dữ liệu      |
| x-internal-key                 | ✅ Yes   | Khóa bảo mật nội bộ |

-------------------------
Body
{
  "keyNo": "VS086.1-260225-058"
}

-------------------------
Response

Success (200)
{
  "success": true,
  "data": {
    "ROID": 7981986,
    "services": [],
    "parts": [],
    "summary": {
      "totalBeforeVAT": 1060959,
      "totalVAT": 84876,
      "grandTotal": 1145836,
      "amountFromCard": 59364,
      "customerPay": 1086472
    }
  }
}
---------------------

Error Handling
401 – Unauthorized
{
   "message": "Token Forbidden"
}

400 – Missing keyNo
{
    "success": false,
    "message": "keyNo is required"
}

500 – Internal Server Error
{
  "success": false,
  "message": "Internal server error"
}

=========================
Example Call API
curl -X POST http://localhost:3000/api/settlementInvoice \
  -H "Content-Type: application/json" \
  -H "x-internal-key: your-secret-key" \
  -d '{
        "keyNo": "VS086.1-260225-058"
      }'