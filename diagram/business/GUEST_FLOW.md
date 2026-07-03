# Guest & Visitor Browsing Flow (Business View)

> [!TIP]
> **IDE Preview:** Press `Ctrl + Shift + V` (Windows/Linux) or `Cmd + Shift + V` (Mac) to open the visual flowchart preview directly inside your editor!

This diagram illustrates the unauthenticated **Guest / Visitor** shopping journey—discovering products, checking pincodes, and the login intercept gate when they attempt to add items to their wishlist or proceed to checkout.

```mermaid
graph TD
    classDef startEnd fill:#1E293B,stroke:#F59E0B,stroke-width:2px,color:#fff;
    classDef process fill:#334155,stroke:#475569,stroke-width:1px,color:#F8FAFC;
    classDef decision fill:#78350F,stroke:#92400E,stroke-width:1px,color:#FEF3C7;
    classDef client fill:#172554,stroke:#1D4ED8,stroke-width:1px,color:#EFF6FF;

    Start([Visitor lands on Homepage]) :::startEnd
    
    Start --> LoadLandingPage[Render Homepage grid] :::client
    LoadLandingPage --> ToggleLang{Toggle English/Tamil Switch?} :::decision
    ToggleLang -->|Yes| Triggeri18n[Reload UI using Tamil translations] :::process
    ToggleLang -->|No| BrowseCatalog[Browse featured products] :::client
    Triggeri18n --> BrowseCatalog

    BrowseCatalog --> NavigationChoice{Catalog Exploration} :::decision
    
    %% Option 1: Search
    NavigationChoice -->|Search Bar| InputSearch[Type product keywords] :::client
    InputSearch --> RenderSearchResults[Display search matches grid] :::client
    RenderSearchResults --> SelectProductCard[Click Product Card] :::client

    %% Option 2: Category Filters
    NavigationChoice -->|Category Filter| ClickCategory[Click Category icon] :::client
    ClickCategory --> RenderCategoryGrid[Display Category Grid] :::client
    RenderCategoryGrid --> SelectProductCard

    %% Product Details
    SelectProductCard --> LoadPDP[Render Product Detail Page] :::client
    LoadPDP --> ChooseVariant["Toggle Variant Selector <br> (e.g. choose 500ml oil variant)"] :::client
    ChooseVariant --> CheckPincode{Has visitor inputted pincode?} :::decision
    
    CheckPincode -->|No| ClickPincodeCheck[Click Check Availability link] :::client
    ClickPincodeCheck --> PromptPincode[Enter 6-digit Pincode] :::client
    PromptPincode --> VerifyDeliverable{Is pincode in delivery zone?} :::decision
    VerifyDeliverable -->|No| ShowOutOfZone[Display Delivery Unavailable alert] :::client
    VerifyDeliverable -->|Yes| ShowDays["Show estimated delivery days <br> (Enables cart actions)"] :::client
    ShowOutOfZone --> PromptPincode
    
    CheckPincode -->|Yes| EnableCartActions[Enable Add to Cart Button] :::client
    ShowDays --> EnableCartActions

    EnableCartActions --> ClickPrimaryAction{Select Action} :::decision
    
    %% Redirect wish list
    ClickPrimaryAction -->|Add to Wishlist| RedirectLoginPrompt[Require Customer Login / Registration] :::client
    
    %% Cart actions
    ClickPrimaryAction -->|Add to Cart| SaveLocalState[Add item and variant to local cart state] :::process
    SaveLocalState --> SyncCartQty[Update cart item counter in header] :::client
    SyncCartQty --> ProceedCheckout[Click Proceed to Checkout] :::client
    ProceedCheckout --> RedirectLoginPrompt

    RedirectLoginPrompt --> AuthenticateUser[User logs in via Google OAuth or Mobile OTP] :::process
    AuthenticateUser --> MergeCarts[Save local cart items into database user cart] :::process
    MergeCarts --> LoadSuccessRoute[Restore checkout route to enter shipping address] :::process
```
