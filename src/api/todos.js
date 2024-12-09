import { client } from "@/utils/http";

const USER_ID = 2048;

export const getTodos = async () => {
  const response = await client.get(`/todos?userId=${USER_ID}`);

  return response.data;
};

export const addTodo = async (title) => {
  const response = await client.post("/todos", {
    userId: USER_ID,
    title,
    completed: false,
  });

  return response.data;
};

export const updateTodo = async ({ title, completed, id }) => {
  const response = await client.patch(`/todos/${id}`, {
    title,
    completed,
  });

  return response.data;
};

export const deleteTodo = async (id) => {
  const response = await client.delete(`/todos/${id}`);

  return response.data;
};
