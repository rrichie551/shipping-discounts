export const FUNCTIONS = `query{
    shopifyFunctions(first: 25){
        edges{
            node{
                id
                title
                app{
                 handle
                }
            }
        }
    }
  }
`;
