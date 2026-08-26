import React from "react";
import { Button } from "../../components/common/Button";

describe("Button Component", () => {
  it("exports valid Button functional component", () => {
    expect(typeof Button).toBe("function");
  });
});
