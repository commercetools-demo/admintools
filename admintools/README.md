<p align="center">
  <a href="https://commercetools.com/">
    <img alt="commercetools logo" src="https://unpkg.com/@commercetools-frontend/assets/logos/commercetools_primary-logo_horizontal_RGB.png">
  </a>
</p>

# admintools

This application provides a streamlined way to manage sellertools. In its current state, Business Users can easily onboard new Sellers.

## 🚀 Seller Onboarding Flow

When you fill out the onboarding form and submit it, here's exactly what happens behind the scenes:

### Step 1: 👤 Create Seller Account
- **What it does**: Creates a new Seller account with the provided information
- **Details**: Sets up the Seller and assigns them to the appropriate customer group
- **Why it matters**: This is the foundation - every business needs a verified Seller account to access the sellertools platform

### Step 2: 📺 Create Distribution & Supply Channel
- **What it does**: Sets up a channel for both inventory management and product distribution
- **Details**: Creates a single channel with dual roles: "InventorySupply" and "ProductDistribution"
- **Why it matters**: This channel configuration allows Sellers to track their own inventory and create their own prices

### Step 3: 🏪 Create Store
- **What it does**: Creates a dedicated store for the Seller
- **Details**: 
  - Enables segmentation of data per Seller. Each seller will only have access to their Orders, Customers, Product Selection, etc.
  - Previously created channel is assigned to Store
- **Why it matters**: Each business gets their own store with control over their Orders, Customers, Product Selection, and more!

### Step 4: 📦 Create & Assign Product Selection
- **What it does**: Creates a product catalog selection and properly assigns it to the store
- **Details**: 
  - Creates an "Inclusive" Product Selection for the Seller
  - Ensures the product selection is active and linked to the correct Store
- **Why it matters**: Product selections control which products can be sold by each Seller

### Step 5: 🏢 Create Business Unit
- **What it does**: Creates the main business entity that ties everything together
- **Details**: 
  - Links the Seller as an admin associate with proper role assignments
  - Assigns the store to the business unit for management
  - Sets up proper permissions and business relationships
  - Includes address information if phone number is provided
- **Why it matters**: Business units are the central hub that manages all business operations

### Step 6: 📨 Send Merchant Center Invitation
- **What it does**: Invites the seller to access the Merchant Center platform
- **Details**: 
  - Retrieves organization and team information from the current project
  - Validates the seller's email for invitation eligibility
  - Sends an invitation to join the configured team (from `MC_TEAM_NAME` environment variable)
- **Why it matters**: Gives sellers access to the Merchant Center interface to manage their business operations
- **Error Handling**: If invitation fails, the onboarding continues but shows a warning notification

## 🔗 How Everything Connects

Here's how all the pieces work together:

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
    ↓ (invited to access)
📨 Merchant Center Platform
```

## 📊 What Gets Created

For a seller named "Johnny Ortiz" from "Business X", the system creates:

- **Seller**: `johnny.ortiz@business-x.com` with verified email and customer group assignment
- **Business Unit**: "Business X" (key: `business-x`) with associate and store relationships
- **Store**: "Business X Store" (key: `business-x-store`) with both distribution and supply channels
- **Channel**: "Business X Channel" (key: `business-x-channel`) with dual roles [InventorySupply, ProductDistribution]
- **Product Selection**: "Business X Selection" (key: `business-x-selection`) properly assigned to store
- **Merchant Center Invitation**: Email invitation sent to `johnny.ortiz@business-x.com` to join the configured team

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
📨 Step 6: Creating Merchant Center invitation...
✅ Merchant Center invitation sent successfully
🎉 === ONBOARD SELLER COMPLETE ===
📊 Summary:
👤 Seller: Johnny Ortiz (johnny.ortiz@business-x.com)
🏢 Business Unit: Business X (business-x)
📺 Channel: business-x-channel [InventorySupply, ProductDistribution]
🏪 Store: business-x-store (Distribution + Supply)
📦 Product Selection: business-x-selection
📨 Merchant Center Invitation: Sent ✅
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
- **Merchant Center Integration**: Automated invitation system using Merchant Center Backend API
- **Environment Configuration**: Requires `MC_TEAM_NAME` environment variable for team assignment
