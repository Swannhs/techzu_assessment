import { jest } from "@jest/globals";

export function createMockResponse() {
  const response = {
    locals: {},
    status: jest.fn(),
    json: jest.fn()
  };

  response.status.mockReturnValue(response);

  return response as any;
}
