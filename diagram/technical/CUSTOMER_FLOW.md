# Customer Order & Checkout Flow (Technical View)

> [!TIP]
> **IDE Preview:** Press `Ctrl + Shift + V` (Windows/Linux) or `Cmd + Shift + V` (Mac) to open the visual flowchart preview directly inside your editor!

This diagram captures the complete technical implementation details, REST API routing paths, database operations, ORM locks, and security logic for the registered **Customer** flow.

```mermaid
graph TD
    classDef startEnd fill:#1E293B,stroke:#10B981,stroke-width:2px,color:#fff;
    classDef process fill:#334155,stroke:#475569,stroke-width:1px,color:#F8FAFC;
    classDef decision fill:#78350F,stroke:#92400E,stroke-width:1px,color:#FEF3C7;
    classDef database fill:#064E3B,stroke:#047857,stroke-width:1px,color:#ECFDF5;
    classDef client fill:#172554,stroke:#1D4ED8,stroke-width:1px,color:#EFF6FF;

    Start([Customer Enters Storefront]) :::startEnd
    
    Start --> NavHome[Browse Home Page] :::client
    NavHome --> ToggleLang{Toggle Language?} :::decision
    ToggleLang -->|Yes| SwitchLocale["Select English / Tamil <br> Updates State via i18n"] :::process
    ToggleLang -->|No| ViewCatalog[Browse Shop Catalog] :::client

    SwitchLocale --> ViewCatalog
    ViewCatalog --> SelectProduct[Select Specific Product] :::client
    SelectProduct --> SelectVariant["Choose Weight/Volume Variant <br> e.g., 250g, 500g, 1kg"] :::client
    SelectVariant --> UpdatePrice[Price Recalculates dynamically] :::process

    UpdatePrice --> CheckPincodeStore{Is Pincode cached in memory?} :::decision
    CheckPincodeStore -->|No| OpenPincodeModal[Prompt for 6-digit Pincode] :::client
    OpenPincodeModal --> InputPincode[Enter Pincode] :::client
    InputPincode --> APIValidatePincode["GET /api/pincode/:pincode"] :::process
    APIValidatePincode --> QueryPincodeDB[("Query Pincode Table")] :::database
    QueryPincodeDB --> VerifyPincode{Is Pincode deliverable?} :::decision
    
    VerifyPincode -->|No| ShowPincodeError[Display Out of Delivery Zone Message] :::client
    ShowPincodeError --> OpenPincodeModal
    
    VerifyPincode -->|Yes| CachePincode["Save Pincode in Zustand State <br> Show estimated delivery days"] :::process
    CheckPincodeStore -->|Yes| AddToCart[Click Add to Cart] :::client
    CachePincode --> AddToCart

    AddToCart --> PostCartAPI["POST /api/v1/cart"] :::process
    PostCartAPI --> UpdateCartDB["Save Item and Selected Variant in Cart Table"] :::database
    UpdateCartDB --> SyncCartState[Sync Store State via React Query] :::process
    SyncCartState --> OpenCartDrawer[Open Cart Sliding Drawer] :::client

    OpenCartDrawer --> ProceedCheckout[Click Proceed to Checkout] :::client
    ProceedCheckout --> VerifyAddress{Has default address?} :::decision
    
    VerifyAddress -->|No| AddressForm[Input Shipping Address Details] :::client
    AddressForm --> SaveAddressAPI["POST /api/v1/addresses"] :::process
    SaveAddressAPI --> SaveAddressDB["Insert Address in Addresses Table"] :::database
    SaveAddressDB --> RenderCheckout[Load Checkout Screen] :::process
    
    VerifyAddress -->|Yes| RenderCheckout

    RenderCheckout --> InputCoupon{Apply Promo Code?} :::decision
    InputCoupon -->|Yes| ValidateCoupon["POST /api/v1/coupons/validate"] :::process
    ValidateCoupon --> CheckCouponDB[("Query Coupons Table")] :::database
    CheckCouponDB --> CouponValid{"Is Coupon Active <br> and Threshold met?"} :::decision
    CouponValid -->|Yes| ApplyDiscount["Deduct Discount from Subtotal <br> recalculate grandTotal"] :::process
    CouponValid -->|No| ShowCouponError[Show Coupon Invalid / Expired alert] :::client
    ShowCouponError --> RenderCheckout
    InputCoupon -->|No| CalcTotals[Calculate subtotal, tax, shipping, grandTotal] :::process
    ApplyDiscount --> CalcTotals

    CalcTotals --> PlaceOrder[Click Place Order] :::client
    PlaceOrder --> CreateOrderAPI["POST /api/v1/orders"] :::process
    CreateOrderAPI --> LockStockDB["Prisma transaction: <br> Lock Variant stock and Decrement"] :::database
    LockStockDB --> SaveDraftOrder["Insert Order as DRAFT in Orders Table"] :::database
    SaveDraftOrder --> InitRazorpay[Init Razorpay Checkout SDK Modal] :::client
    
    InitRazorpay --> CustomerPay{Authorize Payment?} :::decision
    CustomerPay -->|Cancel/Fail| LogFailure["POST /api/v1/payments/fail"] :::process
    LogFailure --> UpdateOrderFail["Set Status: PENDING_PAYMENT"] :::database
    UpdateOrderFail --> ShowPaymentError[Show payment retry window] :::client
    ShowPaymentError --> InitRazorpay
    
    CustomerPay -->|Authorize Success| RazorpayCallback[Razorpay Returns Signature, OrderID, PaymentID] :::client

    RazorpayCallback --> VerifyPaymentAPI["POST /api/v1/payments/verify"] :::process
    VerifyPaymentAPI --> WebhookVerification{"Verify cryptographic signature <br> using webhook secret?"} :::decision
    
    WebhookVerification -->|Invalid| FlagAudit[Log Security Breach in AuditLog] :::database
    FlagAudit --> RejectOrder[Reject order update / Alert Admin] :::process
    
    WebhookVerification -->|Valid| CompleteOrder["Set Payment Status: SUCCESSFUL <br> and Set Order Status: CONFIRMED"] :::database
    CompleteOrder --> ClearCart["POST /api/v1/cart/clear"] :::process
    ClearCart --> ShowOrderSuccess[Show Order Confirmation Dashboard] :::client

    ShowOrderSuccess --> TrackOrder["View Timeline Dashboard <br> CONFIRMED -> PACKED -> SHIPPED -> DELIVERED"] :::client
    TrackOrder --> APIOrderTracking["GET /api/v1/orders/:id"] :::process
    APIOrderTracking --> FetchTrackingDB["Query Order Table status"] :::database
    FetchTrackingDB --> TrackOrder
```
