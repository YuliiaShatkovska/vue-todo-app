<script setup>
import { ref, computed, onMounted, TransitionGroup, watch } from "vue";
import StatusFilter from "./components/StatusFilter.vue";
import TodoItem from "./components/TodoItem.vue";
import Message from "./components/Message.vue";
import * as todoApi from "./api/todos";

const todos = ref([]);
const title = ref("");
const errorMessage = ref(null);
const status = ref("all");

onMounted(async () => {
  try {
    todos.value = await todoApi.getTodos();
  } catch (error) {
    errorMessage.value.show("Unable to load todos");
  }
});

const activeTodos = computed(() =>
  todos.value.filter((todo) => !todo.completed)
);

const visibleTodos = computed(() => {
  if (status.value === "active") {
    return activeTodos.value;
  }

  if (status.value === "completed") {
    return todos.value.filter((todo) => todo.completed);
  }

  return todos.value;
});

const addTodo = async () => {
  if (!title.value) {
    errorMessage.value.show("Title should not be empty");

    return;
  }

  try {
    const newTodo = await todoApi.addTodo(title.value);

    todos.value.push(newTodo);

    title.value = "";
  } catch (error) {
    errorMessage.value.show("Unable to add todo");
  }
};

const deleteTodo = async (id) => {
  try {
    await todoApi.deleteTodo(id);

    todos.value = todos.value.filter((todo) => todo.id !== id);
  } catch (error) {
    errorMessage.value.show("Unable to delete todo");
  }
};

const updateTodo = async ({ title, completed, id }) => {
  try {
    const updatedTodo = await todoApi.updateTodo({ title, completed, id });

    const currentTodo = todos.value.find((todo) => todo.id === id);

    Object.assign(currentTodo, updatedTodo);
  } catch (error) {
    errorMessage.value.show("Unable to update todo");
  }
};
</script>

<template>
  <div class="todoapp">
    <h1 class="todoapp__title">
      todos {{ todos.length > 0 ? todos.length : "" }}
    </h1>

    <div class="todoapp__content">
      <header class="todoapp__header">
        <button
          v-if="todos.length > 0"
          type="button"
          class="todoapp__toggle-all"
          :class="{ active: activeTodos.length === 0 }"
        ></button>

        <form @submit.prevent="addTodo">
          <input
            class="todoapp__new-todo"
            placeholder="What needs to be done?"
            v-model="title"
          />
        </form>
      </header>

      <TransitionGroup
        class="todoapp__main"
        tag="section"
        name="todolist"
        v-if="todos.length > 0"
      >
        <TodoItem
          v-for="todo of visibleTodos"
          :todo="todo"
          :key="todo.id"
          @delete="deleteTodo(todo.id)"
          @update="updateTodo($event)"
        />
      </TransitionGroup>

      <footer class="todoapp__footer" v-if="!!todos.length">
        <span class="todo-count"> {{ activeTodos.length }} items left </span>

        <StatusFilter v-model="status" />

        <button
          type="button"
          class="todoapp__clear-completed"
          :disabled="activeTodos.length === todos.length"
          @click="todos = activeTodos"
        >
          Clear completed
        </button>
      </footer>
    </div>

    <Message class="is-danger" ref="errorMessage">
      <template #header>
        <p>Server Error</p>
      </template>

      <template #default="{ text }">
        <p>{{ text }}</p>
      </template>
    </Message>
  </div>
</template>

<style scoped>
.todolist-enter-active,
.todolist-leave-active {
  max-height: 60px;
  transition: all 0.5s ease;
}
.todolist-enter-from,
.todolist-leave-to {
  opacity: 0;
  max-height: 0;
  transform: scaleY(0);
}
</style>
