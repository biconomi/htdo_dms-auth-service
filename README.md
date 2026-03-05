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


====== 
mô tả cấu trúc json

<!-- Caayu hỏi angent -->
Tổng doanh thu trong khoảng thời gian → total_revenue
Ngày có doanh thu cao nhất → highest_revenue_day
Ngày có doanh thu thấp nhất → lowest_revenue_day
Tháng có doanh thu cao nhất → highest_revenue_month
Tháng có doanh thu thấp nhất → lowest_revenue_month
Doanh thu trung bình trong khoảng thời gian → average_revenue

Doanh thu của từng cố vấn dịch vụ → revenue_by_advisor
Cố vấn có doanh thu cao nhất → top_advisor
Cố vấn có doanh thu thấp nhất → lowest_advisor
Top 3 cố vấn có doanh thu cao nhất → top_3_advisors
Cố vấn có doanh thu cao nhất theo từng tháng → top_advisor_by_month

Doanh thu theo model xe → revenue_by_car_model
Model xe có doanh thu cao nhất → top_revenue_car_model
Model xe có doanh thu thấp nhất → lowest_revenue_car_model

Model xe có số lượng sửa chữa nhiều nhất → top_car_by_count
Top 5 model xe có số lượng sửa chữa nhiều nhất → top_5_cars_by_count


| value1           | rule        | value2                   |
| ---------------- | ----------- | ------------------------ |
| {{$json.action}} | is equal to | total_revenue            |
| {{$json.action}} | is equal to | highest_revenue_day      |
| {{$json.action}} | is equal to | lowest_revenue_day       |
| {{$json.action}} | is equal to | highest_revenue_month    |
| {{$json.action}} | is equal to | lowest_revenue_month     |
| {{$json.action}} | is equal to | average_revenue          |
| {{$json.action}} | is equal to | revenue_by_advisor       |
| {{$json.action}} | is equal to | top_advisor              |
| {{$json.action}} | is equal to | lowest_advisor           |
| {{$json.action}} | is equal to | top_3_advisors           |
| {{$json.action}} | is equal to | top_advisor_by_month     |
| {{$json.action}} | is equal to | revenue_by_car_model     |
| {{$json.action}} | is equal to | top_revenue_car_model    |
| {{$json.action}} | is equal to | lowest_revenue_car_model |
| {{$json.action}} | is equal to | top_car_by_count         |
| {{$json.action}} | is equal to | top_5_cars_by_count      |
