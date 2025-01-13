export const DISCOUNT_NODE = `
    query GetAutomaticDiscount($id: ID!) {
        automaticDiscountNode(id: $id) {
            ... on DiscountAutomaticNode {
            id
            }
            automaticDiscount {
            ... on DiscountAutomaticApp {
                    title 
                }
            }
            metafields(first:25){
           nodes{
             namespace
             key
             value
             id
           }

            }
  }
}
`