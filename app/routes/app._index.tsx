import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Page,
  Text,
  Card,
  BlockStack,
  EmptyState,
  DataTable,
  Badge
} from "@shopify/polaris";
import {
 useLoaderData,
 useNavigate,
 useNavigation
} from "@remix-run/react";
import { Skeleton } from "../components/Skeleton";
import { authenticate } from "../shopify.server";
import {DISCOUNT_NODES} from '../api/DISCOUNT_NODES';
import { FUNCTIONS } from "../api/FUNCTIONS";

type DiscountNode ={
  id: string
  automaticDiscount: Object
}
type FunctionNode ={
  id: string,
  title: string,
  app: Object
}

type LoaderData = {
  discounts: Array<DiscountNode>
  appFunction: Array<FunctionNode>
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const {admin} = await authenticate.admin(request);
  const response = await admin.graphql(DISCOUNT_NODES);
  const functions = await admin.graphql(FUNCTIONS);
  const functionsResponse = await functions.json();
  const appFunction = functionsResponse?.data?.shopifyFunctions?.edges
  ?.filter((edge: any) => edge?.node?.app?.handle === process.env.APP_HANDLE)
  ?.map((edge: any) => edge.node) ?? [];
  const responseJson = await response.json();
  const discountNodes = responseJson?.data?.automaticDiscountNodes?.edges
  ?.filter((edge: any) => edge?.node?.automaticDiscount?.appDiscountType?.app?.handle === process.env.APP_HANDLE)
  ?.map((edge: any) => edge.node) ?? [];

  return {
    discounts: discountNodes,
    appFunction: appFunction
  };

 
};

export const action = async ({ request }: ActionFunctionArgs) => {
 await authenticate.admin(request);
  
  return null;
};

export default function Index() {
 const { discounts, appFunction } =  useLoaderData<LoaderData>();
 const navigate = useNavigate();
 const navigation = useNavigation();
 console.log("Hello");

 if (discounts.length === 0) {
  return (
    <Page
    >
      {navigation.state === "loading" ? (
        <Skeleton />
      ) : (
          <BlockStack gap="600">
                  <Card>
                    <EmptyState
                      heading="Create Your First Shipping Discount"
                      action={{
                        content: "Create Discount",
                        onAction: () => navigate(`/app/shipping-discounts/${appFunction[0].id}/new`)
                      }}
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                    >
                      <p>Create a Shipping Discount to Offer a Percentage Off on All Shippings</p>
                    </EmptyState>
                  </Card>
          </BlockStack>
      )}
    </Page>
  );
}

const handleRowClick = (id: string) => {
  navigate(`/app/shipping-discounts/${appFunction[0].id}/${id}`);
};

const rows = discounts.map(discount => [
  <div key={discount.id} onClick={() => handleRowClick(discount.id.replace('gid://shopify/DiscountAutomaticNode/', ''))} style={{ cursor: 'pointer' }}>
  <Text key={discount.id} variant="bodyMd" as="span" fontWeight="bold">
    {discount?.automaticDiscount?.title}
  </Text>
  </div>
  ,
  <div key={discount.id} onClick={() => handleRowClick(discount.id.replace('gid://shopify/DiscountAutomaticNode/', ''))} style={{ cursor: 'pointer' }}>
  <Badge key={discount.id} tone={discount?.automaticDiscount?.status === 'ACTIVE' ? 'success' : 'attention'}>
    {discount?.automaticDiscount?.status === 'ACTIVE' ? 'Active' : 'Scheduled'}
  </Badge>
  </div>
  ,
  <div key={discount.id} onClick={() => handleRowClick(discount.id.replace('gid://shopify/DiscountAutomaticNode/', ''))} style={{ cursor: 'pointer' }}>
  <Text key={discount.id} variant="bodyMd" as="span">
   Automatic
  </Text>
  </div>
  ,
  <div key={discount.id} onClick={() => handleRowClick(discount.id.replace('gid://shopify/DiscountAutomaticNode/', ''))} style={{ cursor: 'pointer' }}>
  <Text key={discount.id} variant="bodyMd" as="span">
   Shipping
  </Text>
  </div>
  ,
  <div key={discount.id} onClick={() => handleRowClick(discount.id.replace('gid://shopify/DiscountAutomaticNode/', ''))} style={{ cursor: 'pointer' }}>
   <Text key={discount.id} variant="bodyMd" as="span">
    {discount?.automaticDiscount?.asyncUsageCount}
  </Text>
  </div>
 
]);


  return (
    <Page
    title="Dashboard"
      primaryAction={{
        content: "Create a Shipping Discount",
        onAction: () => navigate(`/app/shipping-discounts/${appFunction[0].id}/new`)
      }}
    >
       {navigation.state === "loading" ? (
        <Skeleton />
      ):(
      <DataTable
              columnContentTypes={['text', 'text', 'text', 'text']}
              headings={['Discount Name', 'Status', 'Method', 'Type', 'Used']}
              rows={rows}
            />
          )}
    </Page>
  );
}
