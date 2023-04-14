export default class Todo {
  constructor({
    title = "",
    description = "",
    dueDate = null,
    priority = 4,
    project = "inbox",
    completed = false,
  }) {
    this._title = title;
    this._description = description;
    this._dueDate = dueDate;
    this._priority = priority;
    this._project = project;
    this._completed = completed;
  }

  get title() {
    return this._title;
  }

  set title(newTitle) {
    if (newTitle.length > 0) {
      this._title = newTitle;
    }
  }

  get description() {
    return this._description;
  }

  set description(newDescription) {
    if (typeof newDescription === "string") this._description = newDescription;
  }

  get dueDate() {
    return this._dueDate;
  }

  set dueDate(newDueDate) {
    if (newDueDate instanceof Date) this._dueDate = newDueDate;
  }

  get priority() {
    return this._priority;
  }

  set priority(newPriority) {
    if (newPriority >= 1 && newPriority <= 4) {
      this._priority = newPriority;
    }
  }

  get project() {
    return this._project;
  }

  set project(newProject) {
    if (newProject.length > 0) {
      this._project = newProject;
    }
  }

  get completed() {
    return this._completed;
  }

  set completed(newCompleted) {
    if (typeof newCompleted === "boolean") {
      this._completed = newCompleted;
    }
  }
}
