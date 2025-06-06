<p align="center">
  <a href="https://commercetools.com/">
    <img alt="commercetools logo" src="https://unpkg.com/@commercetools-frontend/assets/logos/commercetools_primary-logo_horizontal_RGB.png">
  </a>
</p>

# admintools - Seller Onboarding System

This application provides a streamlined way to onboard new business sellers into your commercetools platform. When you click the "Onboard Seller" card, the system automatically creates all the necessary resources and relationships for a complete B2B setup.

## 🚀 Seller Onboarding Flow

When you fill out the onboarding form and submit it, here's exactly what happens behind the scenes:

### Step 1: 👤 Create Seller Account
- **What it does**: Creates a new seller account with the provided information
- **Details**: Sets up the seller with external authentication and assigns them to the appropriate customer group
- **Includes**: Automatic email verification token creation and confirmation
- **Why it matters**: This is the foundation - every business needs a verified seller account to access your platform

### Step 2: 📺 Create Distribution & Supply Channel
- **What it does**: Sets up a unified channel for both inventory management and product distribution
- **Details**: Creates a single channel with dual roles: "InventorySupply" and "ProductDistribution"
- **Why it matters**: This channel controls both how products are distributed and how inventory is managed for the business

### Step 3: 🏪 Create Business Store
- **What it does**: Creates a dedicated store for the business seller
- **Details**: 
  - Links the store to the channel as both a distribution channel AND supply channel
  - Enables full inventory and product management capabilities
  - Provides isolated business environment
- **Why it matters**: Each business gets their own store with complete product and inventory control

### Step 4: 📦 Create & Assign Product Selection
- **What it does**: Creates a product catalog selection and properly assigns it to the store
- **Details**: 
  - Creates an "Individual" type product selection with the company name
  - Uses key format like "business-x-selection"
  - Uses `setProductSelections` action to properly assign to the store
  - Ensures the product selection is active and linked
- **Why it matters**: Product selections control which products are available to each business seller

### Step 5: 🏢 Create Business Unit
- **What it does**: Creates the main business entity that ties everything together
- **Details**: 
  - Links the seller as an admin associate with proper role assignments
  - Assigns the store to the business unit for management
  - Sets up proper permissions and business relationships
  - Includes address information if phone number is provided
- **Why it matters**: Business units are the central hub that manages all business operations

## 🔗 How Everything Connects

After the onboarding process completes, here's how all the pieces work together:

```
👤 Seller Account (Verified)
    ↓ (is admin associate of)
🏢 Business Unit
    ↓ (manages)
🏪 Business Store
    ↓ (uses for distribution & supply)
📺 Unified Channel
    ↓ (controls inventory & distribution)
📦 Product Access & Inventory Management
    ↑ (filtered by)
📦 Product Selection (Assigned)
```

## 📊 What Gets Created

For a seller named "Johnny Ortiz" from "Business X", the system creates:

- **Seller**: `johnny.ortiz@business-x.com` with verified email and customer group assignment
- **Business Unit**: "Business X" (key: `business-x`) with associate and store relationships
- **Store**: "Business X Store" (key: `business-x-store`) with both distribution and supply channels
- **Channel**: "Business X Channel" (key: `business-x-channel`) with dual roles [InventorySupply, ProductDistribution]
- **Product Selection**: "Business X Selection" (key: `business-x-selection`) properly assigned to store

## 🎯 Benefits for Your Business

- **Automated Setup**: Complete end-to-end automation with no manual configuration
- **Consistent Structure**: Every seller gets the same professional, complete setup
- **Full Channel Control**: Both inventory supply and product distribution in one channel
- **Proper Product Assignment**: Product selections are correctly linked to stores
- **Scalable Architecture**: Handle hundreds of business sellers with ease
- **Clean Monitoring**: Streamlined console logging for easy tracking and debugging

## 🛠️ Technical Implementation

### Console Logging Flow
The system provides clean, emoji-enhanced logging:

```
🚀 Starting seller onboarding process...
📝 Onboarding: Business X (Johnny Ortiz)
👤 Step 1: Creating seller account...
✅ Seller account created and verified
📺 Step 2: Creating channel...
✅ Channel created with both supply and distribution roles
🏪 Step 3: Creating store...
✅ Store created with distribution and supply channels
📦 Step 4: Creating product selection...
✅ Product selection created and assigned to store
🏢 Step 5: Creating business unit...
✅ Business unit created with store assignment
🎉 === ONBOARD SELLER COMPLETE ===
📊 Summary:
👤 Seller: Johnny Ortiz (johnny.ortiz@business-x.com)
🏢 Business Unit: Business X (business-x)
📺 Channel: business-x-channel [InventorySupply, ProductDistribution]
🏪 Store: business-x-store (Distribution + Supply)
📦 Product Selection: business-x-selection
🔗 All resources created and linked successfully!
```

### Key Technical Features
- **GraphQL Mutations**: For creating and updating resources in commercetools
- **Proper Resource Linking**: Uses correct actions like `setProductSelections` for store assignments
- **Dual Channel Roles**: Single channel handles both supply and distribution
- **React Hooks**: For state management and API calls
- **Form Validation**: Ensures data quality before submission
- **Error Handling**: Graceful handling with user-friendly notifications
- **Comprehensive Logging**: Clean, informative console output for debugging

# Installing the template

Read the [Getting started](https://docs.commercetools.com/merchant-center-customizations/custom-applications) documentation for more information.

# Developing the Custom Application

Learn more about [developing a Custom Application](https://docs.commercetools.com/merchant-center-customizations/development) and [how to use the CLI](https://docs.commercetools.com/merchant-center-customizations/api-reference/cli).
