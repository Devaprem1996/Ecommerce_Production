# Guest & Visitor Browsing Flow (Technical View)

> [!TIP]
> **IDE Preview:** Press `Ctrl + Shift + V` (Windows/Linux) or `Cmd + Shift + V` (Mac) to open the visual flowchart preview directly inside your editor!

This diagram captures unauthenticated guest flows, search engines indexing, category filtering queries, dynamic translations state management, delivery zone lookups, and session synchronization gates redirecting users.

```mermaid
graph TD
    classDef startEnd fill:#1E293B,stroke:#F59E0B,stroke-width:2px,color:#fff;
    classDef process fill:#334155,stroke:#475569,stroke-width:1px,color:#F8FAFC;
    classDef decision fill:#78350F,stroke:#92400E,stroke-width:1px,color:#FEF3C7;
    classDef database fill:#064E3B,stroke:#047857,stroke-width:1px,color:#ECFDF5;
    classDef client fill:#172554,stroke:#1D4ED8,stroke-width:1px,color:#EFF6FF;

    Start([Guest Accesses URL]) :::startEnd
    
    Start --> LoadLandingPage[Render Homepage] :::client
    LoadLandingPage --> FetchHomeContent["GET /api/v1/products/featured"] :::process
    FetchHomeContent --> QueryFeaturedDB["Fetch featured products and categories"] :::database
    QueryFeaturedDB --> RenderFeatured["Render Hero Banners, FAQ Accordion, <br> and Featured Product Cards"] :::client

    RenderFeatured --> SelectLang{Toggle English/Tamil Switch?} :::decision
    SelectLang -->|Yes| Triggeri18n[Toggle i18next Locale state] :::process
    Triggeri18n --> ReRenderBilingual["Re-render UI components <br> loading English/Tamil title tags"] :::client
    SelectLang -->|No| DiscoverProducts[Browse Catalog] :::client
    ReRenderBilingual --> DiscoverProducts

    DiscoverProducts --> NavigationChoice{Discovery Method} :::decision
    
    NavigationChoice -->|Search Bar| InputSearch[Type query in Search Bar] :::client
    InputSearch --> APISearch["GET /api/v1/products?search=query"] :::process
    APISearch --> SearchDBQuery["Query Product DB: search matches name/tags"] :::database
    SearchDBQuery --> RenderSearchResults[Display matching items grid] :::client
    RenderSearchResults --> SelectProductCard[Click Product Card] :::client

    NavigationChoice -->|Category Grid| ClickCategory[Select Category Icon] :::client
    ClickCategory --> APICategoryFilter["GET /api/v1/products?category=slug"] :::process
    APICategoryFilter --> CategoryDBQuery["Query DB for Category specific products"] :::database
    CategoryDBQuery --> RenderCategoryGrid[Display Category Grid] :::client
    RenderCategoryGrid --> SelectProductCard

    SelectProductCard --> LoadPDP[Load Product Detail Page] :::client
    LoadPDP --> FetchProductDetail["GET /api/v1/products/:slug"] :::process
    FetchProductDetail --> QueryProductInfo["Query Product, Variants and Average Review Stars"] :::database
    QueryProductInfo --> RenderPDP["Render Product Details, Collapsible tabs, <br> and Variant Selection Dropdown"] :::client

    RenderPDP --> InteractVariant["Toggle variant options <br> e.g. change 250ml to 500ml"] :::client
    InteractVariant --> UpdatePricingUI[Dynamic price indicator updates] :::process
    
    UpdatePricingUI --> CheckPincode{Has Guest inputted pincode?} :::decision
    CheckPincode -->|No| ClickPincodeCheck[Click Check Availability link] :::client
    ClickPincodeCheck --> PromptPincode[Enter 6-digit Pincode] :::client
    PromptPincode --> APIValidate["GET /api/pincode/:pincode"] :::process
    APIValidate --> VerifyDeliverable{Is Pincode Deliverable?} :::decision
    
    VerifyDeliverable -->|No| ShowOutOfZone[Display delivery unavailable notice] :::client
    ShowOutOfZone --> PromptPincode
    
    VerifyDeliverable -->|Yes| ShowDays["Display Estimated delivery days <br> Cache Pincode in memory"] :::client
    CheckPincode -->|Yes| EnableCartActions[Enable Add to Cart Button] :::client
    ShowDays --> EnableCartActions

    EnableCartActions --> ClickPrimaryAction{Choose Action} :::decision
    
    ClickPrimaryAction -->|Add to Wishlist| BlockWishlist[Intercept Action] :::process
    BlockWishlist --> RedirectLoginPrompt[Load Login Screen with callback URL] :::client
    
    ClickPrimaryAction -->|Add to Cart| CheckCartDB{Add item to database cart?} :::decision
    CheckCartDB -->|No - Local Cart| SaveLocalState[Add item and variant to Zustand Local Cart State] :::process
    SaveLocalState --> SyncCartQty[Display badge quantity counter on header] :::client
    SyncCartQty --> ProceedCheckout[Guest clicks Proceed to Checkout] :::client
    ProceedCheckout --> InterceptCheckout[Intercept Action] :::process
    InterceptCheckout --> RedirectLoginPrompt
    
    RedirectLoginPrompt --> AuthenticateUser[User authenticates via Google OAuth / OTP] :::process
    AuthenticateUser --> MergeCarts["Post-Login: Sync local guest cart <br> items into database cart table"] :::process
    MergeCarts --> LoadSuccessRoute["Restore original destination <br> e.g. proceed to address form"] :::process
```
