class TodoContainer {
  #name;
  constructor({ name = "" }) {
    this.#name = name;
    this.todos = [];
    this.completedTodos = [];
  }

  insertTodoSorted(array, todo) {
    if (
      !todo.dueDate ||
      !array.length ||
      !array[this.todos.length - 1] ||
      array[array.length - 1].dueDate < todo.dueDate
    ) {
      array.push(todo);
    } else {
      for (let i = 0; i < array.length; i++) {
        if (!array.dueDate || array[i].dueDate > todo.dueDate) {
          array.splice(i, 0, todo);
          break;
        }
      }
    }
  }

  addTodo(todo) {
    this.insertTodoSorted(this.todos, todo);
  }

  removeTodo(index) {
    const [todo] = this.todos.splice(index, 1);
    this.insertTodoSorted(this.completedTodos, todo);
  }

  deleteTodo(index) {
    this.completedTodos.splice(index, 1);
  }

  get name() {
    return this.#name;
  }

  set name(name) {
    if (name) this.#name = name;
  }

  get completedTodosCount() {
    return this.completedTodos.length;
  }

  get todosCount() {
    return this.todos.length;
  }
}

export default class Project extends TodoContainer {
  sections = [];
  #description;

  constructor({ name = "", description = "" }) {
    super({ name });
    this.#description = description;
  }

  addSection(name) {
    this.sections.push(new TodoContainer({ name }));
  }

  get description() {
    return this.#description;
  }

  set description(description) {
    if (description) this.#description = description;
  }

  get todosCount() {
    return (
      this.todos.length +
      this.sections.reduce((acc, section) => acc + section.todosCount, 0)
    );
  }

  get completedTodosCount() {
    return (
      this.completedTodos.length +
      this.sections.reduce(
        (acc, section) => acc + section.completedTodosCount,
        0
      )
    );
  }
}
