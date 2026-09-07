import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import QuestionForm from "../components/QuestionForm";

describe("QuestionForm Validation", () => {
  const defaultProps = {
    register: vi.fn(),
    errors: {},
    currentQuestionType: "mcq",
    fields: [
      { id: "1", value: "Option A" },
      { id: "2", value: "Option B" },
    ],
    watch: vi.fn(),
    setValue: vi.fn(),
    remove: vi.fn(),
    append: vi.fn(),
    handleSubmit: vi.fn((fn) => fn),
    onSubmitForm: vi.fn(),
  };

  it("renders without crashing and displays form title", () => {
    render(<QuestionForm {...defaultProps} />);
    expect(screen.getByText("Finalize Question")).toBeInTheDocument();
  });

  it("displays error message when question text is missing", () => {
    const propsWithError = {
      ...defaultProps,
      errors: {
        questionText: { message: "Question text is required" },
      },
    };
    render(<QuestionForm {...propsWithError} />);
    expect(screen.getByText("Question text is required")).toBeInTheDocument();
  });

  it("displays error message when an option is missing for MCQ", () => {
    const propsWithError = {
      ...defaultProps,
      errors: {
        options: [{ value: { message: "Option text cannot be empty" } }],
      },
    };
    render(<QuestionForm {...propsWithError} />);
    expect(screen.getByText("Option text cannot be empty")).toBeInTheDocument();
  });

  it("displays correct answer input for short answer questions", () => {
    render(<QuestionForm {...defaultProps} currentQuestionType="text" />);
    const input = screen.getByPlaceholderText("Correct answer...");
    expect(input).toBeInTheDocument();
  });

  it("triggers onSubmitForm when Save Question is clicked", () => {
    render(<QuestionForm {...defaultProps} />);
    const saveButton = screen.getByText("Save Question");
    fireEvent.click(saveButton);
    expect(defaultProps.onSubmitForm).toHaveBeenCalled();
  });
});
