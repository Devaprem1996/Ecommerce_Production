# Customer Order & Checkout Flow (Business View)

> [!TIP]
> **IDE Preview:** Press `Ctrl + Shift + V` (Windows/Linux) or `Cmd + Shift + V` (Mac) to open the visual flowchart preview directly inside your editor!

This diagram illustrates the registered **Customer** shopping experience and checkout journey, focused entirely on the user experience (UX) and business logic.

```mermaid
graph TD
    classDef startEnd fill:#1E293B,stroke:#10B981,stroke-width:2px,color:#fff;
    classDef process fill:#334155,stroke:#475569,stroke-width:1px,color:#F8FAFC;
    classDef decision fill:#78350F,stroke:#92400E,stroke-width:1px,color:#FEF3C7;
    classDef client fill:#172554,stroke:#1D4ED8,stroke-width:1px,color:#EFF6FF;

    Start([Customer Enters Storefront]) :::startEnd
    
    Start --> NavHome[Browse Home Page] :::client
    NavHome --> ToggleLang{Toggle Language?} :::decision
    ToggleLang -->|Yes| SwitchLocale["Select English / Tamil <br> (Translates page titles and details)"] :::process
    ToggleLang -->|No| ViewCatalog[Browse Shop Catalog] :::client

    SwitchLocale --> ViewCatalog
    ViewCatalog --> SelectProduct[Select Specific Product] :::client
    SelectProduct --> SelectVariant["Choose Weight/Volume Option <br> (e.g., 250g, 500g, 1kg)"] :::client
    SelectVariant --> UpdatePrice[Price updates dynamically on card] :::process

    UpdatePrice --> CheckPincodeStore{Has pincode been checked?} :::decision
    CheckPincodeStore -->|No| OpenPincodeModal[Prompt to enter 6-digit Pincode] :::client
    OpenPincodeModal --> InputPincode[Enter Pincode] :::client
    InputPincode --> VerifyPincode{Is address within <br> delivery zones?} :::decision
    
    VerifyPincode -->|No| ShowPincodeError[Display Delivery Unavailable message] :::client
    ShowPincodeError --> OpenPincodeModal
    
    VerifyPincode -->|Yes| CachePincode["Unlock checkout and <br> show estimated delivery days"] :::process
    CheckPincodeStore -->|Yes| AddToCart[Click Add to Cart] :::client
    CachePincode --> AddToCart

    AddToCart --> OpenCartDrawer[Open Cart Sliding Drawer] :::client
    OpenCartDrawer --> ProceedCheckout[Click Proceed to Checkout] :::client
    ProceedCheckout --> VerifyAddress{Has shipping address saved?} :::decision
    
    VerifyAddress -->|No| AddressForm[Input Shipping Address details] :::client
    AddressForm --> RenderCheckout[Load Checkout Summary Screen] :::process
    VerifyAddress -->|Yes| RenderCheckout

    RenderCheckout --> InputCoupon{Have a Coupon Code?} :::decision
    InputCoupon -->|Yes| ValidateCoupon[Verify coupon active and min-order met] :::process
    ValidateCoupon --> CouponValid{Is code valid?} :::decision
    CouponValid -->|Yes| ApplyDiscount[Apply discount rate to cart totals] :::process
    CouponValid -->|No| ShowCouponError[Show Coupon Invalid / Expired alert] :::client
    ShowCouponError --> RenderCheckout
    InputCoupon -->|No| CalcTotals[Calculate subtotal, shipping charge, and grand total] :::process
    ApplyDiscount --> CalcTotals

    CalcTotals --> PlaceOrder[Click Place Order] :::client
    PlaceOrder --> VerifyStock{Is variant stock available?} :::decision
    VerifyStock -->|No| ShowStockError[Show Out of Stock notification] :::client
    VerifyStock -->|Yes| InitRazorpay[Open Secured Payment Window] :::client
    
    InitRazorpay --> CustomerPay{Complete Payment?} :::decision
    CustomerPay -->|Cancel/Fail| ShowPaymentError[Show payment failure / Try again options] :::client
    ShowPaymentError --> InitRazorpay
    
    CustomerPay -->|Success| ShowOrderSuccess[Show Order Confirmation page] :::client
    ShowOrderSuccess --> TrackOrder["Track Order Status <br> (Confirmed -> Packed -> Shipped -> Delivered)"] :::client
```
