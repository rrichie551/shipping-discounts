# Installation & Setup

## 1. Environment Variables
Create `.env` file in the root directory:
```env
SCOPES=write_discounts
SHOPIFY_API_KEY=cd73947631fcb8e430ca616088525b69
SHOPIFY_API_SECRET=804913082c094e083f2c1d5c4392dcdb
SHOPIFY_SHIPPING_DISCOUNT_ID=8afec72f-cac6-4347-ae71-09c0fe02d2df
APP_HANDLE=shipping-discounts-9
```

## 2. App Configuration
Update `shopify.app.toml`:

```toml
name = "Your App Name"
handle= "your-app-handle"
client_id = "your_client_id"
dev_store_url ="your_dev_store_url"
```
or you can generate a new one.

## 3. Deploy and Development

Deploy function extension and Access Scope

```shell
shopify app deploy
```

Start local development:

```shell
shopify app dev
```

