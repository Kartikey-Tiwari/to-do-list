export default class Todo {
  #title;
  #description;
  #dueDate;
  #priority;
  #project;
  #completed;
  constructor({
    title = "",
    description = "",
    dueDate = null,
    priority = 4,
    project = "inbox",
    completed = false,
  }) {
    this.#title = title;
    this.#description = description;
    this.#dueDate = dueDate;
    this.#priority = priority;
    this.#project = project;
    this.#completed = completed;
  }

  get title() {
    return this.#title;
  }

  set title(newTitle) {
    if (newTitle.length > 0) {
      this.#title = newTitle;
    }
  }

  get description() {
    return this.#description;
  }

  set description(newDescription) {
    if (typeof newDescription === "string") this.#description = newDescription;
  }

  get dueDate() {
    return this.#dueDate;
  }

  set dueDate(newDueDate) {
    if (newDueDate instanceof Date) this.#dueDate = newDueDate;
  }

  get priority() {
    return this.#priority;
  }

  set priority(newPriority) {
    if (newPriority >= 1 && newPriority <= 4) {
      this.#priority = newPriority;
    }
  }

  get project() {
    return this.#project;
  }

  set project(newProject) {
    if (newProject.length > 0) {
      this.#project = newProject;
    }
  }

  get completed() {
    return this.#completed;
  }

  set completed(newCompleted) {
    if (typeof newCompleted === "boolean") {
      this.#completed = newCompleted;
    }
  }
}
