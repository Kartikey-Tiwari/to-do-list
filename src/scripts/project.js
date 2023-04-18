class TodoContainer {
  constructor(name = "") {
    this._name = name;
    this._todos = [];
    this._completedTodos = [];
  }

  insertTodoSorted(array, todo) {
    if (
      !todo.dueDate ||
      !array.length ||
      !array[this.todos.length - 1] ||
      array[array.length - 1].dueDate < todo.dueDate
    ) {
      array.push(todo);
      return array.length - 1;
    } else {
      for (let i = 0; i < array.length; i++) {
        if (!array.dueDate || array[i].dueDate > todo.dueDate) {
          array.splice(i, 0, todo);
          return i;
        }
      }
    }
  }

  addTodo(todo) {
    return this.insertTodoSorted(this.todos, todo);
  }

  removeTodo(index) {
    const [todo] = this.todos.splice(index, 1);
    this.insertTodoSorted(this.completedTodos, todo);
  }

  deleteTodo(index) {
    this.completedTodos.splice(index, 1);
  }

  get name() {
    return this._name;
  }

  set name(name) {
    if (name) this._name = name;
  }

  get completedTodosCount() {
    return this._completedTodos.length;
  }

  get todosCount() {
    return this._todos.length;
  }

  get todos() {
    return this._todos;
  }

  get completedTodos() {
    return this._completedTodos;
  }
}

class Project extends TodoContainer {
  constructor(name = "", description = "") {
    super(name);
    this._description = description;
    this._sections = [];
  }

  addSection(name, index = this.sections.length) {
    const newSection = new TodoContainer(name);
    newSection.num = index;
    this._sections.splice(index, 0, newSection);
    for (let i = index + 1; i < this._sections.length; i++) {
      this._sections[i].num = i;
    }
  }

  get description() {
    return this._description;
  }

  set description(description) {
    if (description) this._description = description;
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

  get sections() {
    return this._sections;
  }
}

export { Project, TodoContainer };
