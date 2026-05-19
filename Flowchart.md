# Buy-Sell-Store — Project Flowcharts

Top-to-bottom views of the **Buy-Sell-Store** monorepo: system architecture, backend, frontend, user journeys, and data flow.

> **How to view:** Paste any `mermaid` block into [Mermaid Live Editor](https://mermaid.live) or open this file on GitHub / VS Code with a Mermaid preview extension.

---

## Table of contents

1. [System overview](#1-system-overview)
2. [Repository structure](#2-repository-structure)
3. [Runtime architecture](#3-runtime-architecture)
4. [Backend layers](#4-backend-layers)
5. [Backend request flow](#5-backend-request-flow)
6. [GraphQL API surface](#6-graphql-api-surface)
7. [Data model (conceptual)](#7-data-model-conceptual)
8. [Frontend bootstrap](#8-frontend-bootstrap)
9. [Frontend route map](#9-frontend-route-map)
10. [Authentication flow](#10-authentication-flow)
11. [Buyer shopping flow](#11-buyer-shopping-flow)
12. [Seller management flow](#12-seller-management-flow)
13. [Feature → implementation map](#13-feature--implementation-map)

---

## 1. System overview

High-level view of the two applications and external dependencies.

```mermaid
flowchart TB
  subgraph users["Users"]
    Browser["Web browser"]
  end

  subgraph frontend["buyandsellstoreweb — React SPA :3000"]
    CRA["Create React App\nReact 19 + React Router 6"]
    Apollo["Apollo Client → /graphql"]
    Ctx["UserContext + localStorage"]
    CRA --> Apollo
    CRA --> Ctx
  end

  subgraph backend["buyandsellstore — Spring Boot :8080"]
  direction TB
    GQL["Spring GraphQL\n/graphql"]
    REST["REST\n/upload, /auth"]
    Static["Static files\n/uploads/**"]
    GQL --> Resolvers["Resolvers"]
    REST --> Disk["uploads/ directory"]
    Static --> Disk
    Resolvers --> Services["Services"]
    Services --> Repos["MongoDB repositories"]
  end

  subgraph infra["Infrastructure"]
    Mongo[(MongoDB)]
    SMTP[(SMTP — password reset)]
  end

  Browser --> frontend
  Apollo <-->|"POST GraphQL\ncredentials: include"| GQL
  Browser -->|"multipart POST"| REST
  Browser -->|"GET images"| Static
  Repos --> Mongo
  Services --> SMTP
```

---

## 2. Repository structure

```mermaid
flowchart TB
  Root["Buy-Sell-Store/"]

  Root --> BE["buyandsellstore/\nJava 17 · Maven · Spring Boot 3.4"]
  Root --> FE["buyandsellstoreweb/\nReact 19 · CRA · npm"]
  Root --> Doc["Flowchart.md, README.md"]

  BE --> BEsrc["src/main/java/.../app/"]
  BE --> BEres["src/main/resources/\napplication.properties\ngraphql/schema.graphqls"]
  BE --> BEtest["src/test/java/"]

  BEsrc --> Resolvers["resolver/"]
  BEsrc --> Services["service/"]
  BEsrc --> Repos["repository/"]
  BEsrc --> Models["model/"]
  BEsrc --> Controllers["controller/"]
  BEsrc --> Config["config/"]

  FE --> FEsrc["src/"]
  FEsrc --> Screens["screens/ — page components"]
  FEsrc --> Components["components/ — Header, Footer"]
  FEsrc --> Context["context/UserContext.js"]
  FEsrc --> App["App.js — routes + Apollo"]
```

---

## 3. Runtime architecture

Ports, protocols, and integration points.

```mermaid
flowchart LR
  subgraph client["Client — localhost:3000"]
    UI["React UI"]
    AC["Apollo Client"]
    Fetch["fetch() — Profile, uploads"]
    UI --> AC
    UI --> Fetch
  end

  subgraph server["Server — localhost:8080"]
    GQL["/graphql"]
    UP["POST /upload"]
    AUTH["POST /auth/*"]
    FILES["GET /uploads/*"]
    GQL --> SB["Spring Boot app"]
    UP --> SB
    AUTH --> SB
    FILES --> SB
  end

  subgraph data["Data & services"]
    MDB[(MongoDB :27020)]
    MAIL[(Mailersend SMTP)]
  end

  AC --> GQL
  Fetch --> GQL
  Fetch --> UP
  UI --> FILES
  SB --> MDB
  SB --> MAIL
```

| Component | URL / path | Purpose |
|-----------|------------|---------|
| React dev server | `http://localhost:3000` | SPA |
| GraphQL API | `http://localhost:8080/graphql` | Primary API |
| GraphiQL | `http://localhost:8080/graphiql` | API explorer (dev) |
| File upload | `POST http://localhost:8080/upload` | Product / profile images |
| Static uploads | `GET http://localhost:8080/uploads/{file}` | Served files |
| MongoDB | `mongodb://...@localhost:27020/buyAndSellStore_prod` | Persistence |

---

## 4. Backend layers

```mermaid
flowchart TB
  subgraph presentation["Presentation"]
    GR["GraphQL resolvers\nAuth, Book, HomeItem, Cart,\nOrder, Wishlist, User, Seller,\nRecommendation"]
    FC["FileUploadController"]
    ACtrl["AuthController"]
  end

  subgraph business["Business logic — Services"]
    US["UserService"]
    BS["BookService"]
    HS["HomeItemService"]
    CS["CartService"]
    OS["OrderService"]
    WS["WishlistItemService"]
    PRS["PasswordResetService"]
    ES["EmailService"]
    RS["RecommendationService"]
  end

  subgraph persistence["Persistence — Spring Data MongoDB"]
    UR["UserRepository"]
    BR["BookRepository"]
    HR["HomeItemRepository"]
    CR["CartRepository"]
    OR["OrderRepository"]
    WR["WishlistItemRepository"]
    PTR["PasswordResetTokenRepository"]
    RVR["ReviewRepository"]
  end

  subgraph crosscut["Cross-cutting"]
    CFG["CorsConfig, UploadCorsConfig"]
    SEC["SecurityConfig — BCrypt"]
    STAT["StaticResourceConfig"]
  end

  GR --> business
  FC --> STAT
  ACtrl --> PRS
  business --> persistence
  PRS --> ES
```

---

## 5. Backend request flow

Typical GraphQL request from UI to database.

```mermaid
sequenceDiagram
  participant UI as React screen
  participant AC as Apollo / fetch
  participant SB as Spring Boot
  participant R as GraphQL resolver
  participant S as Service
  participant DB as MongoDB

  UI->>AC: useQuery / useMutation / fetch
  AC->>SB: POST /graphql { query, variables }
  SB->>R: dispatch to @QueryMapping / @MutationMapping
  R->>S: business rules, validation
  S->>DB: save / find documents
  DB-->>S: entities
  S-->>R: result DTO / model
  R-->>SB: GraphQL response JSON
  SB-->>AC: { data, errors }
  AC-->>UI: render / cache update
```

**Profile image upload (alternate path):**

```mermaid
sequenceDiagram
  participant P as ProfileScreen
  participant UP as POST /upload
  participant GQL as POST /graphql
  participant DB as MongoDB

  P->>UP: multipart file
  UP-->>P: { url: "/uploads/..." }
  P->>GQL: updateUser(profilePictureUrl)
  GQL->>DB: persist user
  GQL-->>P: updated User
```

---

## 6. GraphQL API surface

Major operations grouped by domain (see `buyandsellstore/src/main/resources/graphql/schema.graphqls`).

```mermaid
flowchart LR
  subgraph queries["Queries"]
    Q1["books, book, getBooksBySellerId"]
    Q2["homeItems, homeItem, getHomeItemsBySellerId"]
    Q3["cartItems, getOrdersByUserId"]
    Q4["wishlistItems, wishlistCount"]
    Q5["getSellerStatistics"]
    Q6["recommendBooksForUser"]
    Q7["getSoldItemsBySellerId"]
  end

  subgraph mutations["Mutations"]
    M1["login, signup"]
    M2["addToCart, removeFromCart, createOrder"]
    M3["add/update/remove WishlistItem"]
    M4["uploadBook, updateBook"]
    M5["uploadHomeItem, updateHomeItem"]
    M6["add/update/delete Review — book & homeItem"]
    M7["forgotPassword, resetPassword"]
    M8["updateUser"]
  end

  subgraph subs["Subscriptions — schema only"]
    S1["wishlistItemAdded/Updated/Removed"]
  end

  Client["React + Apollo"] --> queries
  Client --> mutations
  Client -.->|"not used in web app"| subs
```

---

## 7. Data model (conceptual)

Core MongoDB documents and relationships (simplified).

```mermaid
erDiagram
  User ||--o{ Order : places
  User ||--o| Cart : has
  User ||--o{ WishlistItem : saves
  User {
    string id
    string username
    string email
    boolean isSeller
    Address billing
    Address shipping
  }

  Book ||--o{ Review : has
  Book {
    string id
    string title
    string sellerId
    float price
    int totalQuantity
  }

  HomeItem ||--o{ Review : has
  HomeItem {
    string id
    string title
    string type
    string sellerId
    int totalQuantity
  }

  Cart ||--|{ CartItem : contains
  CartItem {
    string itemId
    string type
    int quantity
    float price
  }

  Order ||--|{ CartItem : contains
  Order {
    string id
    string userId
    float totalPrice
    datetime createdAt
  }

  WishlistItem {
    string userId
    string itemId
    string type
  }

  SoldItem {
    string itemId
    string sellerId
    int quantity
  }
```

---

## 8. Frontend bootstrap

How the React app initializes on every page load.

```mermaid
flowchart TB
  Start([index.html loads]) --> Index["index.js"]
  Index --> App["App.js"]

  App --> ApolloP["ApolloProvider\nHttpLink → :8080/graphql\ncleanTypenameLink"]
  ApolloP --> UserP["UserProvider\nread user from localStorage"]
  UserP --> Router["BrowserRouter"]
  Router --> Layout["Layout component"]
  Layout --> HeaderCheck{Logged in and\nnot auth route?}
  HeaderCheck -->|Yes| Header["Header.jsx"]
  HeaderCheck -->|No| SkipHeader["No header"]
  Header --> Routes["<Routes> → screen"]
  SkipHeader --> Routes
```

---

## 9. Frontend route map

All routes defined in `buyandsellstoreweb/src/App.js`.

```mermaid
flowchart TB
  subgraph public["Public routes"]
    login["/login"]
    signup["/signup"]
    forgot["/forgotpassword"]
    reset["/reset-password"]
    homeItem["/home-item/:id"]
    sellerDash["/seller-dashboard"]
    manageInv["/manageinventory"]
    upload["/uploadItems"]
    revenue["/revenue"]
  end

  subgraph protected["Protected — ProtectedRoute"]
    home["/home"]
    sellerHome["/sellerHome"]
    books["/books"]
    bookId["/book/:id"]
    homeitems["/homeitems"]
    cart["/cart"]
    wishlist["/wishlist"]
    checkout["/checkoutScreen"]
    profile["/profile"]
    sellerstats["/sellerstats"]
    inventory["/inventory"]
  end

  wildcard["* unknown path"] -->|Navigate| home

  Guard["ProtectedRoute:\nuser in UserContext?"]
  Guard -->|No| login
  Guard -->|Yes| protected
```

| Path | Screen | Protected? | Header when logged in? |
|------|--------|:------------:|:----------------------:|
| `/login` | LoginScreen | No | Hidden |
| `/signup` | SignUpScreen | No | Hidden |
| `/forgotpassword` | ForgotPasswordScreen | No | Hidden |
| `/reset-password` | ResetPasswordScreen | No | Hidden |
| `/home` | HomeScreen | Yes | Yes |
| `/books` | BooksScreen | Yes | Yes |
| `/book/:id` | BookDetailScreen | Yes | Yes |
| `/homeitems` | HomeItemsScreen | Yes | Yes |
| `/home-item/:id` | HomeItem | No | Yes |
| `/cart` | CartScreen | Yes | Yes |
| `/wishlist` | WishlistScreen | Yes | Yes |
| `/checkoutScreen` | CheckoutScreen | Yes | Yes |
| `/profile` | ProfileScreen | Yes | Yes |
| `/sellerHome` | SellerHome | Yes | Yes |
| `/sellerstats` | SellerStats | Yes | Yes |
| `/manageinventory` | ManageInventory | No | Yes |
| `/uploadItems` | UploadItems | No | Yes |
| `/inventory` | Inventory | Yes | Yes |
| `/revenue` | Revenue | No | Yes |
| `/seller-dashboard` | SellerDashboard | No | Yes |
| `*` | → `/home` | — | — |

---

## 10. Authentication flow

```mermaid
flowchart TD
  Start([User opens app]) --> Unknown{Known route?}
  Unknown -->|*| Redirect["Navigate → /home"]
  Redirect --> HasUser{user in\nUserContext?}
  HasUser -->|No| LoginPage["/login"]
  HasUser -->|Yes| AppHome["/home or seller area"]

  LoginPage --> SubmitLogin["login mutation"]
  SubmitLogin -->|fail| LoginPage
  SubmitLogin -->|success| Store["UserContext.login()\n+ localStorage"]
  Store --> IsSeller{isSeller?}
  IsSeller -->|Yes| SH["/sellerHome"]
  IsSeller -->|No| BH["/home"]

  LoginPage --> SignUp["/signup"]
  SignUp -->|success| LoginPage

  LoginPage --> Forgot["/forgotpassword"]
  Forgot --> Reset["/reset-password"]
  Reset -->|success| LoginPage

  AnyLoggedIn["Any screen with Header"] --> Logout["logout()"]
  Logout --> LoginPage
```

---

## 11. Buyer shopping flow

End-to-end path for a non-seller user.

```mermaid
flowchart TD
  BH["/home — category hub"] --> Books["/books"]
  BH --> HomeItems["/homeitems"]

  Books --> BookDetail["/book/:id"]
  HomeItems --> HomeItemDetail["/home-item/:id"]

  BookDetail --> Actions["Add to cart · Wishlist · Reviews"]
  HomeItemDetail --> Actions

  Header["Header: Cart / Wishlist / Profile"] --> Cart["/cart"]
  Header --> Wishlist["/wishlist"]
  Header --> Profile["/profile"]

  Wishlist -->|add to cart| Cart
  Cart --> Checkout["/checkoutScreen"]
  Checkout --> OrderDone["Order confirmation"]

  Profile --> Orders["View order history\nfetch getOrdersByUserId"]
  Profile --> Addresses["Update billing/shipping\nupdateUser mutation"]
  Profile --> Avatar["POST /upload → updateUser"]
```

---

## 12. Seller management flow

```mermaid
flowchart TD
  Login["Login as seller"] --> SH["/sellerHome"]

  SH --> Stats["/sellerstats\nCharts · getSellerStatistics"]
  SH --> Manage["/manageinventory"]
  SH --> Revenue["/revenue\ngetSoldItemsBySellerId"]
  SH -.->|navigates to /orders| Missing["/orders — route not defined"]

  Manage --> Upload["/uploadItems\nuploadBook · uploadHomeItem"]
  Manage --> Inv["/inventory\nupdateBook · updateHomeItem"]

  HeaderClick["Header title click"] --> SH
```

---

## 13. Feature → implementation map

Quick reference linking product features to code locations.

```mermaid
flowchart LR
  subgraph features["Features"]
    F1["Auth"]
    F2["Catalog"]
    F3["Cart & checkout"]
    F4["Wishlist"]
    F5["Reviews"]
    F6["Seller CRUD"]
    F7["Analytics"]
    F8["Profile & uploads"]
  end

  subgraph fe["Frontend screens"]
    FE1["Login, SignUp, Forgot, Reset"]
    FE2["Books, HomeItems, BookDetail, HomeItem"]
    FE3["Cart, Checkout"]
    FE4["Wishlist"]
    FE5["BookDetail, HomeItem"]
    FE6["UploadItems, Inventory"]
    FE7["SellerStats, Revenue, SellerDashboard"]
    FE8["ProfileScreen"]
  end

  subgraph be["Backend"]
    BE1["AuthResolver · UserService"]
    BE2["BookResolver · HomeItemResolver"]
    BE3["CartResolver · OrderResolver"]
    BE4["WishlistItemResolver"]
    BE5["Book/HomeItem review mutations"]
    BE6["BookService · HomeItemService"]
    BE7["SellerResolver · OrderService"]
    BE8["UserResolver · FileUploadController"]
  end

  F1 --> FE1 --> BE1
  F2 --> FE2 --> BE2
  F3 --> FE3 --> BE3
  F4 --> FE4 --> BE4
  F5 --> FE5 --> BE5
  F6 --> FE6 --> BE6
  F7 --> FE7 --> BE7
  F8 --> FE8 --> BE8
```

---

## Technology stack (reference)

| Layer | Technologies |
|-------|----------------|
| **Frontend** | React 19, Create React App, React Router 6, Apollo Client, styled-components, react-hook-form, Yup, Chart.js, react-toastify |
| **Backend** | Java 17, Spring Boot 3.4, Spring GraphQL, Spring Data MongoDB, Spring Web, Spring Mail, Spring Security Crypto |
| **Database** | MongoDB |
| **API** | GraphQL (+ REST for uploads and legacy auth endpoints) |

---

*Generated for the Buy-Sell-Store repository. Update this file when routes, resolvers, or architecture change.*
