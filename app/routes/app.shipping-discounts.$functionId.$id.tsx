import { useEffect } from "react";
import {
  Banner,
  Card,
  FormLayout,
  Layout,
  Page,
  TextField,
  BlockStack,
  InlineGrid
} from "@shopify/polaris";
import {
  Form,
  useActionData,
  useNavigation,
  useSubmit,
  useLoaderData,
  useNavigate
} from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Skeleton } from "app/components/Skeleton";
import { DISCOUNT_NODE } from "app/api/DISCOUNT_NODE";
import { CREATE_DISCOUNT_NODE } from "app/api/CREATE_DISCOUNT_NODE";
import { UPDATE_DISCOUNT_NODE } from "app/api/UPDATE_DISCOUNT_NODE";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { authenticate } from "../shopify.server";

interface FormData {
  title: string;
  amount: string;
  percentage: string;
}

const discountSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  amount: z.string()
    .min(1, "Amount is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Amount must be a valid number")
    .transform((val: string): number => parseFloat(val))
    .refine((val: number): boolean => val >= 0, "Amount must be positive"),
  percentage: z.string()
    .min(1, "Percentage is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Percentage can't be negative")
    .transform((val: string): number => parseFloat(val))
    .refine((val: number): boolean => val >= 0 && val <= 100, "Percentage must be between 0 and 100")
});

type LoaderData = {
    title: string,
    amount: string,
    percentage: string,
    namespace: string,
    key: string,
    id: string
  };
  
type ActionData = {
    errors?: { message: string }[];
};


export const loader = async ({ params, request } : LoaderFunctionArgs) => {
  const { id } = params;
  
  if (id === "new") {
    return {
      title: "",  
      amount: "",
      percentage: "",
      key:"function-configuration",
      namespace: "$app:shipping-discount"
    };
  }

  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(DISCOUNT_NODE,{
    variables:{
      id: `gid://shopify/DiscountAutomaticNode/${id}`
    }
  });

  const responseJson = await response.json();
  console.log(responseJson.data.automaticDiscountNode?.metafields, "This is the response");
  const title = responseJson.data.automaticDiscountNode?.automaticDiscount?.title;
  const metafield =
    responseJson.data.automaticDiscountNode?.metafields?.nodes[0]?.value &&
    JSON.parse(responseJson.data.automaticDiscountNode.metafields.nodes[0].value);

  return json<LoaderData>({
    title: title,
    amount: metafield?.amount ?? "0",
    percentage: metafield?.percentage ?? "0",
    key: responseJson.data.automaticDiscountNode?.metafields?.nodes[0]?.key,
    namespace: responseJson.data.automaticDiscountNode?.metafields?.nodes[0]?.namespace,
    id:  responseJson.data.automaticDiscountNode?.metafields?.nodes[0]?.id
  });
};

export const action = async ({ params, request } : ActionFunctionArgs) => {
  const { functionId, id } = params;
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const amount = formData.get("amount");
  const percentage =  parseFloat(formData.get("percentage")?.toString() ?? "0");
  const title = formData.get("title");
  const key = formData.get("key");
  const namespace = formData.get("namespace");
  const metafieldId = formData.get("metafieldId");

  const baseDiscount = {
    functionId,
    title,
    startsAt: new Date(),
    endsAt: null,
  };

  const metafields = [
    {
      namespace:namespace,
      key: key,
      type: "json",
      value: JSON.stringify({
        amount: amount,
        percentage: percentage,
      }),
    },
  ];

  if (id === "new") {
    const response = await admin.graphql(CREATE_DISCOUNT_NODE,
        {
          variables: {
            discount: {
                ...baseDiscount,
                metafields,
              },
          },
        },
      );

    const responseJson = await response.json();
    const errors = responseJson.data.discountCreate?.userErrors;
    console.log("these are the errors",errors);
    return json<ActionData>({ errors });

  } else {
    const response = await admin.graphql(UPDATE_DISCOUNT_NODE,
        {
          variables: {
            id: `gid://shopify/DiscountAutomaticNode/${id}`,
            automaticAppDiscount: {
                ...baseDiscount,
                metafields:[{
                  namespace: namespace,
                  key: key,
                  id: metafieldId,
                  type: "json",
                  value: JSON.stringify({
                    amount,
                    percentage
                  })
                }]
            }
          },
        },
      );

    const responseJson = await response.json();
    const errors = responseJson.data.discountAutomaticAppUpdate?.userErrors;
    console.log("Errors", errors);
    return json<ActionData>({ errors });
  }
};

export default function PaymentCustomization() {
  const submit = useSubmit();
  const navigate = useNavigate();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const loaderData = useLoaderData<LoaderData>();
  const app = useAppBridge();
  const key = loaderData.key;
  const namespace = loaderData.namespace;
  const metafieldId = loaderData.id;

  useEffect(() => {
    if (actionData) {
      if (actionData?.errors?.length === 0) {
        app.toast.show("Successful!!");
          navigate("/app");
      } 
    }
  }, [actionData, app, navigate]);

  const isLoading = navigation.state === "submitting";

  const errorBanner = actionData?.errors?.length ? (
    <Layout.Section>
      <Banner
        title="There was an error creating the customization."
        tone="critical"
      >
      
          {actionData?.errors.map((error) => {
            return error.message;
          })}
        
      </Banner>
    </Layout.Section>
  ) : null;

  
  const {
      control,
      handleSubmit,
      formState: { errors }
    } = useForm<FormData>({
      defaultValues: {
        title: loaderData.title,
        amount: loaderData.amount,
        percentage: loaderData.percentage
      },
      resolver: zodResolver(discountSchema)
    });
    const onSubmit = (data: FormData) => {
      const submissionData = {
        ...data,
        key,
        namespace,
        metafieldId
      };
      submit(submissionData, { method: "post" });
    };
  return (
    <Page
      title="Create A Shipping Discount"
      backAction={{
        content: "Shipping Discount",
        onAction: () =>
          navigate("/app")
      }}
      primaryAction={{
        content: "Save",
        loading: isLoading,
        onAction: handleSubmit(onSubmit),
      }}
    >
      {navigation.state === "loading" ? (
        <Skeleton />
      ):(
      <Layout>
        {errorBanner}
        <Layout.Section>
          <Card>
            <Form method="post">
              <FormLayout>
                <FormLayout.Group>
                 <BlockStack>
                 <Controller 
                 render={({ field: { onChange, value } }) => (
                  <TextField
                    type="text"
                    label="Title"
                    value={value}
                    onChange={onChange}
                    error={errors?.title?.message}
                    disabled={isLoading}
                    autoComplete="off"
                    requiredIndicator
                  />
                )}
                name={"title"}
                control={control}
                 />
                  </BlockStack>
                 
                  </FormLayout.Group>
                  <FormLayout.Group>
                  <InlineGrid gap="400" columns={2}>
                  <Controller render={({ field: { onChange, value } }) => (
                      <TextField
                        type="number"
                        label="Cart Amount Greater Than"
                        value={value}
                        onChange={onChange}
                        error={errors?.amount?.message}
                        disabled={isLoading}
                        autoComplete="off"
                        requiredIndicator
                      />
                    )}
                name={"amount"}
                control={control}
                />
                <Controller  render={({ field: { onChange, value } }) => (
                   <TextField
                    type="number"
                    label="Discount Value(Percentage)"
                    value={value}
                    onChange={onChange}
                    error={errors?.percentage?.message}
                    disabled={isLoading}
                    autoComplete="off"
                    requiredIndicator
                  />
      )}
                name={"percentage"}
                control={control}
                />
                  </InlineGrid>
                  </FormLayout.Group>
               
              </FormLayout>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
      )}
    </Page>
  );
}
