# Installation & Setup


## 1. Cloning the Repo Locally
```shell
git clone https://github.com/rrichie551/shipping-discounts.git
```


## 2. Environment Variables
Create `.env` file in the root directory:
```env
SCOPES=write_discounts
SHOPIFY_API_KEY=cd73947631fcb8e430ca616088525b69
SHOPIFY_API_SECRET=804913082c094e083f2c1d5c4392dcdb
APP_HANDLE=shipping-discounts-9
```
replace the values with your own app values

## 3. App Configuration
Update `shopify.app.toml`:

```toml
name = "Your App Name"
handle= "your-app-handle"
client_id = "your_client_id"
dev_store_url ="your_dev_store_url"
```
or you can generate a new one.

## 4. Node Modules

Install the node modules

```shell
npm i
```

## 5. Deploy and Development
Deploy function extension and Access Scope

```shell
shopify app deploy
```

Start local development:

```shell
shopify app dev
```

