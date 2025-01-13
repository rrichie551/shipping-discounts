import type {
  RunInput,
  FunctionRunResult
} from "../generated/api";

const EMPTY_DISCOUNT: FunctionRunResult = {
  discounts: [],
};

type Configuration = {
  amount: number,
  percentage: number,
};

export function run(input: RunInput): FunctionRunResult {
  const configuration: Configuration = JSON.parse(
    input?.discountNode?.metafield?.value ?? "{}"
  );
  if(!configuration.amount || !configuration.percentage) {
    return EMPTY_DISCOUNT;
  }
  const cartAmount = parseFloat(input?.cart?.cost?.totalAmount?.amount);
  if(cartAmount > configuration.amount){
    const deliveryGroups = input?.cart?.deliveryGroups ?? [];
    const targets = deliveryGroups.map(group => ({
      deliveryGroup: {
        id: group.id
      }
    }));
    return {
      discounts: [
        {
          targets,
          value: {
            percentage: {
              value: configuration.percentage,
            },
          },
        },
      ]
    };
  }
  else{
    console.error(`Cart Value is less than ${configuration.amount}`);
      return EMPTY_DISCOUNT;
  }
 
};