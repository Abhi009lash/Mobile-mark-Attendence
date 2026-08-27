import React from "react";
import { render } from "@testing-library/react-native";
import { MetricCard } from "../../components/common/MetricCard";

describe("MetricCard Component", () => {
  it("renders label and value correctly", () => {
    const { getByText } = render(<MetricCard label="Total Staff" value={42} />);
    expect(getByText("Total Staff")).toBeTruthy();
    expect(getByText("42")).toBeTruthy();
  });

  it("renders subtitle when provided", () => {
    const { getByText } = render(
      <MetricCard label="Present" value="38" subtitle="90% attendance" />
    );
    expect(getByText("90% attendance")).toBeTruthy();
  });
});
