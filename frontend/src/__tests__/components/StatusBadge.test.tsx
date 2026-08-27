import React from "react";
import { render } from "@testing-library/react-native";
import { StatusBadge } from "../../components/common/StatusBadge";

describe("StatusBadge Component", () => {
  it("renders present status correctly", () => {
    const { getByText } = render(<StatusBadge status="present" />);
    expect(getByText("Present")).toBeTruthy();
  });

  it("renders late status correctly", () => {
    const { getByText } = render(<StatusBadge status="late" />);
    expect(getByText("Late")).toBeTruthy();
  });

  it("renders custom label when provided", () => {
    const { getByText } = render(<StatusBadge status="absent" label="NOT MARKED" />);
    expect(getByText("NOT MARKED")).toBeTruthy();
  });
});
