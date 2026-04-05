import React from "react";
import { Button, Card, PriceTag } from "@voltix/ui-kit";

const App = () => (
  <div>
    <h1>Catalog</h1>
    <Card>
      <p>Shared UI from @voltix/ui-kit</p>
      <PriceTag amount={99.99} currency="USD" />
      <Button type="button" variant="primary">
        Add to cart
      </Button>
    </Card>
  </div>
);

export default App;
