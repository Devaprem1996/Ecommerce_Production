# Administrator Operations Flow (Business View)

> [!TIP]
> **IDE Preview:** Press `Ctrl + Shift + V` (Windows/Linux) or `Cmd + Shift + V` (Mac) to open the visual flowchart preview directly inside your editor!
> 
> *   For the detailed **Technical & Developer Implementation Flowchart**, see [technical/ADMIN_FLOW.md](file:///c:/Users/user/Desktop/ecommerce-production/diagram/technical/ADMIN_FLOW.md).

This diagram illustrates the core administrative control loops of an **Admin** user, focused on catalog management, order processing, and discount creation.

```mermaid
graph TD
    classDef startEnd fill:#1E293B,stroke:#3B82F6,stroke-width:2px,color:#fff;
    classDef process fill:#334155,stroke:#475569,stroke-width:1px,color:#F8FAFC;
    classDef decision fill:#78350F,stroke:#92400E,stroke-width:1px,color:#FEF3C7;
    classDef client fill:#172554,stroke:#1D4ED8,stroke-width:1px,color:#EFF6FF;

    Start([Admin Enters Dashboard URL]) :::startEnd
    
    Start --> VerifyAuth{Is Admin logged in?} :::decision
    VerifyAuth -->|No| RedirectLogin[Redirect to Admin login page] :::client
    RedirectLogin --> InputCredentials[Input password credentials] :::client
    InputCredentials --> VerifyRole{Is user role verified as ADMIN?} :::decision
    VerifyRole -->|No| RejectAccess[Access Denied / Forbidden warning] :::client
    VerifyRole -->|Yes| RenderDashboard[Render Administrative Overview Dashboard] :::client
    VerifyAuth -->|Yes| RenderDashboard

    RenderDashboard --> SelectMenu{Choose Dashboard Action} :::decision
    
    %% Route 1: Catalog CRUD
    SelectMenu -->|Product Management| ProductPanel[Open Product Inventory Panel] :::client
    ProductPanel --> ActionProduct{Select Action} :::decision
    ActionProduct -->|Add Product| ProductForm["Fill Details <br> (Enter English & Tamil Name/Description)"] :::client
    ProductForm --> AddVariants["Add weight/volume options <br> (e.g. 500g: 200 INR, 1kg: 380 INR)"] :::client
    AddVariants --> SelectImage[Select product image file] :::client
    SaveProduct --> RefreshCatalog[Refresh Dashboard Product List] :::process

    ActionProduct -->|Edit/Delete| SelectProductRow[Select product item] :::client
    SelectProductRow --> UpdateProductDB[Apply changes or Soft-Delete product] :::process
    UpdateProductDB --> RefreshCatalog

    %% Route 2: Category Management
    SelectMenu -->|Category Management| CategoryPanel[Open Category Manager] :::client
    CategoryPanel --> CategoryForm["Input details <br> (English/Tamil Category Name & Slug)"] :::client
    CategoryForm --> SaveCategory[Add Category to Storefront Filter list] :::process
    SaveCategory --> RefreshCatalog

    %% Route 3: Coupon Configuration
    SelectMenu -->|Coupon Code Manager| CouponPanel[Open Coupon Code panel] :::client
    CouponPanel --> CouponForm[Enter code, discount type, value, expiry date] :::client
    CouponForm --> SaveCoupon[Publish coupon code for customers] :::process
    SaveCoupon --> RefreshCatalog

    %% Route 4: Order Dispatching
    SelectMenu -->|Order Processing| OrderPanel[Open Orders Panel] :::client
    OrderPanel --> RenderOrdersList[Render order summary grid] :::client
    RenderOrdersList --> SelectOrder[Select active customer order] :::client
    SelectOrder --> ProcessOrder{Update Dispatch Stage?} :::decision
    ProcessOrder -->|Set Packed| SetPacked[Mark order status as PACKED] :::process
    ProcessOrder -->|Set Shipped| SetShipped[Mark order status as SHIPPED] :::process
    ProcessOrder -->|Set Delivered| SetDelivered[Mark order status as DELIVERED] :::process
    
    SetPacked --> NotifyCustomer[Send shipping status email update] :::process
    SetShipped --> NotifyCustomer
    SetDelivered --> NotifyCustomer
    NotifyCustomer --> RenderOrdersList
```
