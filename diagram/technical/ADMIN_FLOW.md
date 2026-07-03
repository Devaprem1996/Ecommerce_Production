# Administrator Operations Flow (Technical View)

> [!TIP]
> **IDE Preview:** Press `Ctrl + Shift + V` (Windows/Linux) or `Cmd + Shift + V` (Mac) to open the visual flowchart preview directly inside your editor!

This diagram captures the admin dashboard operations, detailing session verification layers, category/product CRUD with image processing optimization pipelines, coupon generation, and transactional dispatch order triggers.

```mermaid
graph TD
    classDef startEnd fill:#1E293B,stroke:#3B82F6,stroke-width:2px,color:#fff;
    classDef process fill:#334155,stroke:#475569,stroke-width:1px,color:#F8FAFC;
    classDef decision fill:#78350F,stroke:#92400E,stroke-width:1px,color:#FEF3C7;
    classDef database fill:#064E3B,stroke:#047857,stroke-width:1px,color:#ECFDF5;
    classDef client fill:#172554,stroke:#1D4ED8,stroke-width:1px,color:#EFF6FF;

    Start([Admin Launches Dashboard]) :::startEnd
    
    Start --> RequestDashboard["GET /admin/dashboard"] :::client
    RequestDashboard --> VerifyAuth{Is admin session verified?} :::decision
    VerifyAuth -->|No| RedirectLogin[Redirect to Admin login page] :::client
    RedirectLogin --> InputCredentials[Input credentials] :::client
    InputCredentials --> APISignIn["POST /api/v1/auth/login"] :::process
    APISignIn --> DBCheckRole{Verify User Role is ADMIN?} :::decision
    DBCheckRole -->|Customer/Guest| LogBreach[Create Security alert in AuditLog] :::database
    LogBreach --> RejectAccess[Access Denied - 403 Forbidden] :::client
    DBCheckRole -->|Admin| GenerateToken["Generate Admin JWT and HttpOnly Cookie"] :::process
    GenerateToken --> SetSession[Store Admin state in Zustand] :::process
    SetSession --> RenderDashboard[Render Admin Analytics Dashboard] :::client
    VerifyAuth -->|Yes| RenderDashboard

    RenderDashboard --> SelectMenu{Select Sidebar Menu} :::decision
    
    SelectMenu -->|Product CRUD| ProductPanel[Open Product Management Console] :::client
    ProductPanel --> ActionProduct{Select Action} :::decision
    ActionProduct -->|Add Product| ProductForm["Fill Product Details <br> Enter English and Tamil Name/Description"] :::client
    ProductForm --> AddVariants["Add weight/volume options <br> e.g. 500g: 200 INR, 1kg: 380 INR"] :::client
    AddVariants --> SelectImage[Select Product Photo File] :::client
    
    SelectImage --> ImageCompressPipeline["Compress and Optimize image in memory via Sharp"] :::process
    ImageCompressPipeline --> UploadCloudinary[Upload image to Cloudinary CDN] :::process
    UploadCloudinary --> CloudinaryReturn[Return optimized image URL] :::process
    
    CloudinaryReturn --> SubmitProduct[Click Submit Product] :::client
    SubmitProduct --> APIAddProduct["POST /api/v1/products"] :::process
    APIAddProduct --> WriteProductDB["Insert Product, Variants and Initial Inventory in DB"] :::database
    WriteProductDB --> LogProductAction[Record action in AuditLog table] :::database
    LogProductAction --> RefreshProductGrid[Refresh Admin Catalog View] :::client

    ActionProduct -->|Edit/Delete| SelectProductRow[Select product row] :::client
    SelectProductRow --> APIEditProduct["PUT/DELETE /api/v1/products/:id"] :::process
    APIEditProduct --> WriteChangesDB["Update/Soft-Delete in Product Table"] :::database
    WriteChangesDB --> RefreshProductGrid

    SelectMenu -->|Category Management| CategoryPanel[Open Category Manager] :::client
    CategoryPanel --> CategoryForm["Input Category bilingual metadata <br> English/Tamil Name and Slug"] :::client
    CategoryForm --> SubmitCategory["POST /api/v1/categories"] :::process
    SubmitCategory --> WriteCategoryDB["Insert Category in Categories Table"] :::database
    WriteCategoryDB --> RefreshCategories[Refresh Category list] :::client

    SelectMenu -->|Coupon Code Console| CouponPanel[Open Coupon Manager] :::client
    CouponPanel --> CouponForm[Input code, discount type, value, expiry date] :::client
    CouponForm --> SubmitCoupon["POST /api/v1/coupons"] :::process
    SubmitCoupon --> WriteCouponDB["Insert Coupon in Coupons Table"] :::database
    WriteCouponDB --> RefreshCoupons[Refresh Coupons Dashboard] :::client

    SelectMenu -->|Order Processing| OrderPanel[Open Orders Panel] :::client
    OrderPanel --> FetchOrders["GET /api/v1/orders"] :::process
    FetchOrders --> QueryOrdersDB["Query orders sorted by date"] :::database
    QueryOrdersDB --> RenderOrdersList[Render order records grid] :::client
    RenderOrdersList --> SelectOrder[Select order item to process] :::client
    SelectOrder --> ProcessOrder{Update Status?} :::decision
    ProcessOrder -->|Set Packed| APIUpdatePacked["PATCH /api/v1/orders/:id/status"] :::process
    APIUpdatePacked --> UpdateDBPacked["Set OrderStatus: PACKED"] :::database
    ProcessOrder -->|Set Shipped| APIUpdateShipped["PATCH /api/v1/orders/:id/status"] :::process
    APIUpdateShipped --> UpdateDBShipped["Set OrderStatus: SHIPPED"] :::database
    ProcessOrder -->|Set Delivered| APIUpdateDelivered["PATCH /api/v1/orders/:id/status"] :::process
    APIUpdateDelivered --> UpdateDBDelivered["Set OrderStatus: DELIVERED"] :::database
    
    UpdateDBPacked --> SendUpdateNotify[Trigger order status update event] :::process
    UpdateDBShipped --> SendUpdateNotify
    UpdateDBDelivered --> SendUpdateNotify
    SendUpdateNotify --> RenderOrdersList
```
