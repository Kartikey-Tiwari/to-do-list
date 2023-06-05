import TodoList from "./todolist.js";
import Todo from "./todos.js";
import { Project, TodoContainer } from "./project.js";
import {
  format,
  isToday,
  isTomorrow,
  isWithinInterval,
  addDays,
  isPast,
  endOfDay,
  startOfToday,
} from "date-fns";

let curProject = "Inbox";
let curProjectIndex = 0;

const addSectionForm = document.querySelector(".add-section");
const inlineForm = document.querySelector(".inline-form");
inlineForm.querySelector(".input-btn-row").addEventListener("click", (e) => {
  e.preventDefault();
  const tag = e.target.tagName;
  if (tag === "BUTTON" || tag === "svg" || tag === "SPAN") {
    const btn = e.target.closest("button");
    if (btn && !btn.disabled) {
      btn.nextElementSibling.showPicker();
    }
  }
});

function removeDateTimeClasses(e) {
  e.classList.remove("today", "tomorrow", "this-week");
}

document.querySelectorAll(".cancel-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    main.querySelectorAll(".add-todo-btn").forEach((button) => {
      button.style.display = "flex";
    });
    btn.form.style.display = "none";

    const desc = btn.form.querySelector(".todo-desc-input");
    desc.textContent = "";
    desc.nextElementSibling.style.display = "block";
    desc.nextElementSibling.style.top = "27px";

    const title = btn.form.querySelector(".todo-title-input");
    title.textContent = "";
    title.nextElementSibling.style.display = "block";

    const date = btn.form.querySelector('input[type="date"]');
    date.value = "";
    removeDateTimeClasses(date.previousElementSibling);
    date.previousElementSibling.lastElementChild.textContent = "Date";

    const time = btn.form.querySelector('input[type="time"]');
    time.value = "";
    time.previousElementSibling.disabled = true;
    removeDateTimeClasses(time.previousElementSibling);
    time.previousElementSibling.lastElementChild.textContent = "Time";
    time.nextElementSibling.style.display = "none";

    const priority = btn.form.querySelector('select[name="priority"]');
    priority.value = "4";

    btn.form.querySelector(".add-task-btn").disabled = true;
  });
});

document.querySelectorAll(".add-task-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const form = btn.closest("form");
    const title = form.querySelector(".todo-title-input").textContent;
    if (!title) return;
    const desc = form.querySelector(".todo-desc-input").textContent;
    const date = form.querySelector('input[type="date"]').value;
    const time = form.querySelector('input[type="time"]').value;
    if (!date && time) return;
    const priority = form.querySelector('select[name="priority"]').value;
    if (!priority) return;
    const project = form.querySelector(".project-selector").value;
    if (!project) return;

    const projectData = project.split("/");
    const projectName = projectData[0];
    const projectNum = +projectData[1];
    const sectionName = projectData[2];
    const sectionNum = +projectData[3];

    let todoContainer;
    if (sectionName === "") {
      todoContainer = TodoList.projects[projectNum];
    } else {
      todoContainer = TodoList.projects[projectNum].sections[sectionNum];
    }

    const todo = new Todo({
      title,
      description: desc,
      dueDate: date ? new Date(date + " " + time) : null,
      dueTime: time ? true : false,
      priority: +priority,
      project: sectionName
        ? TodoList.projects[projectNum].sections[sectionNum]
        : TodoList.projects[projectNum],
      completed: false,
    });

    if (projectName === curProject && projectNum === curProjectIndex) {
      const i = sectionName ? sectionNum + 1 : 0;
      const idx = todoContainer.addTodo(todo);
      createTodo(
        sectionsList.children[i].querySelector(".tasks-list"),
        todo,
        todoContainer,
        idx
      );
    }
    btn.form.querySelector(".cancel-btn").click();
  });
});

document.querySelectorAll(".duedate-input").forEach((input) => {
  input.nextElementSibling.setAttribute(
    "min",
    new Date().toISOString().split("T")[0]
  );
  input.nextElementSibling.addEventListener("input", (e) => {
    removeDateTimeClasses(input);
    removeDateTimeClasses(input.nextElementSibling.nextElementSibling);

    if (input.nextElementSibling.value !== "") {
      const date = new Date(input.nextElementSibling.value);
      input.lastElementChild.textContent = format(date, "d MMM yyyy");
      input.nextElementSibling.nextElementSibling.disabled = false;

      if (!isToday(date) && isPast(date)) {
        return;
      }
      const today = new Date();
      const nextWeek = addDays(today, 7);

      if (isToday(date)) {
        input.lastElementChild.textContent = "Today";
        input.classList.add("today");
        if (
          input.nextElementSibling.nextElementSibling.nextElementSibling.value
        ) {
          input.nextElementSibling.nextElementSibling.classList.add("today");
        }
      } else if (isTomorrow(date)) {
        input.lastElementChild.textContent = "Tomorrow";
        input.classList.add("tomorrow");
        if (
          input.nextElementSibling.nextElementSibling.nextElementSibling.value
        ) {
          input.nextElementSibling.nextElementSibling.classList.add("tomorrow");
        }
      } else if (isWithinInterval(date, { start: today, end: nextWeek })) {
        input.lastElementChild.textContent = format(date, "EEEE");
        input.classList.add("this-week");
        if (
          input.nextElementSibling.nextElementSibling.nextElementSibling.value
        ) {
          input.nextElementSibling.nextElementSibling.classList.add(
            "this-week"
          );
        }
      }
    } else {
      input.lastElementChild.textContent = "Date";
      input.nextElementSibling.nextElementSibling.disabled = true;
    }
  });
});

const formTextInputs = document.querySelectorAll(
  '.todo-input-text div[contenteditable="true"]'
);
formTextInputs.forEach((input) => {
  input.addEventListener("input", (e) => {
    const addTodo = input.closest("form").querySelector(".add-task-btn");
    if (input.textContent === "") {
      input.nextElementSibling.style.display = "block";
      if (input.classList.contains("todo-title-input")) {
        input
          .closest(".todo-input-text")
          .querySelector(".todo-desc-input ~ .placeholder").style.top = "27px";
        addTodo.disabled = true;
      }
    } else {
      input.nextElementSibling.style.display = "none";
      if (input.classList.contains("todo-title-input")) {
        input
          .closest(".todo-input-text")
          .querySelector(".todo-desc-input ~ .placeholder").style.top =
          5 + input.clientHeight + "px";
        addTodo.disabled = false;
      }
    }
  });
});

document.querySelector(".clear-time-input").addEventListener("click", (e) => {
  e.preventDefault();
  const inputEvent = new Event("input", { bubbles: false });
  const input = e.target.previousElementSibling;
  input.value = "";
  input.dispatchEvent(inputEvent);
});

document.querySelectorAll(".time-input").forEach((input) => {
  input.nextElementSibling.addEventListener("input", (e) => {
    if (input.nextElementSibling.value !== "") {
      input.nextElementSibling.nextElementSibling.style.display = "block";
      input.lastElementChild.textContent = input.nextElementSibling.value;
      if (
        input.previousElementSibling.previousElementSibling.classList.contains(
          "today"
        )
      )
        input.classList.add("today");
      else if (
        input.previousElementSibling.previousElementSibling.classList.contains(
          "tomorrow"
        )
      )
        input.classList.add("tomorrow");
      else if (
        input.previousElementSibling.previousElementSibling.classList.contains(
          "this-week"
        )
      )
        input.classList.add("this-week");
    } else {
      input.nextElementSibling.nextElementSibling.style.display = "none";
      input.lastElementChild.textContent = "Time";
      removeDateTimeClasses(input);
    }
  });
});
const saved = localStorage.getItem("todoList");

if (saved) {
  TodoList.projects = JSON.parse(saved);
  TodoList.projects = TodoList.projects.map((project) => {
    return Object.assign(new Project(), project);
  });
  TodoList.projects.forEach((project) => {
    project.sections = project.sections.map((section) => {
      return Object.assign(new TodoContainer(), section);
    });

    project.sections.forEach((section) => {
      section.todos = section.todos.map((todo) => {
        return Object.assign(new Todo(), todo);
      });
      section.completedTodos = section.completedTodos.map((todo) => {
        return Object.assign(new Todo(), todo);
      });
    });
    project.todos = project.todos.map((todo) => {
      return Object.assign(new Todo(), todo);
    });
  });
}

function populateProjectSelectorOptions() {
  const projectSelector = document.querySelectorAll(".project-selector");
  projectSelector.forEach((selector) => {
    selector.innerHTML = "";
  });
  TodoList.projects.forEach((project) => {
    const option = document.createElement("option");
    option.value =
      project.name + "/" + (project.num ? `(${project.num})` : "0") + "//";
    option.textContent = project.name;
    projectSelector.forEach((selector) => {
      selector.appendChild(option.cloneNode(true));
    });
    project.sections.forEach((section) => {
      const option = document.createElement("option");
      option.value = `${project.name}/${project.num ? project.num : "0"}/${
        section.name
      }/${section.num}`;
      option.textContent = `${project.name} > ${section.name}`;
      projectSelector.forEach((selector) => {
        selector.appendChild(option.cloneNode(true));
      });
    });
  });
}
const main = document.querySelector("main");
const sectionsList = main.querySelector("ul#sections-list");
const liHTML = `<li><section class="section"><header class="section-header"><div class="collapse-list"><svg width="24" height="24"><path fill="none" stroke=" currentColor" d="M16 10l-4 4-4-4"></path></svg></div><div class="section-info"><button class="section-name"><span></span></button><span></span></div><button class="todo-more-options"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" ><gfill="none"stroke="currentColor" stroke-linecap="round" transform="translate(3 10)"><circle cx="2" cy="2" r="2"></circle><circle cx="9" cy="2" r="2"></circle><circle cx="16" cy="2" r="2"></circle></g></svg></button></header><ul class="tasks-list"></ul><li><button class="add-todo-btn"><span><svg width="13" height="13"><path d="M6 6V.5a.5.5 0 011 0V6h5.5a.5.5 0 110 1H7v5.5a.5.5 0 11-1 0V7H.5a.5.5 0 010-1H6z" fill="currentColor" fill-rule="evenodd"></path></svg></span><span>Add task</span></button></li></section><button class="add-section-btn">Add a section</button></li>`;
const todoHTML = `<li class="todo"><button class="checkbox-container"><div class="checkbox"><svg width="24" height="24"><path fill="currentColor" d="M11.23 13.7l-2.15-2a.55.55 0 0 0-.74-.01l.03-.03a.46.46 0 0 0 0 .68L11.24 15l5.4-5.01a.45.45 0 0 0 0-.68l.02.03a.55.55 0 0 0-.73 0l-4.7 4.35z"></path></svg></div></button><div class="todo-info"><div class="todo-title-desc"><span class="todo-title"></span><span class="todo-desc"></span></div><div class="due-date"><span></span><span></span></div><div class="todo-options"><button class="edit-todo"><svg width="24" height="24" style=""><g fill="none" fill-rule="evenodd"><path fill="currentColor" d="M9.5 19h10a.5.5 0 110 1h-10a.5.5 0 110-1z"></path><path stroke="currentColor" d="M4.42 16.03a1.5 1.5 0 00-.43.9l-.22 2.02a.5.5 0 00.55.55l2.02-.21a1.5 1.5 0 00.9-.44L18.7 7.4a1.5 1.5 0 000-2.12l-.7-.7a1.5 1.5 0 00-2.13 0L4.42 16.02z"></path></g></svg></button><button class="delete"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><g fill="none" fill-rule="evenodd"><path d="M0 0h24v24H0z"></path><rect width="14" height="1" x="5" y="6" fill="currentColor" rx="0.5"></rect><path fill="currentColor" d="M10 9h1v8h-1V9zm3 0h1v8h-1V9z"></path><path stroke="currentColor" d="M17.5 6.5h-11V18A1.5 1.5 0 008 19.5h8a1.5 1.5 0 001.5-1.5V6.5zm-9 0h7V5A1.5 1.5 0 0014 3.5h-4A1.5 1.5 0 008.5 5v1.5z"></path></g></svg></button></div></div></li>`;

function createSectionDOM(name, idx, section) {
  const div = document.createElement("div");
  div.innerHTML = liHTML;
  const sectionLi = div.firstElementChild;

  sectionsList.insertBefore(sectionLi, sectionsList.children[idx]);

  if (!name) sectionLi.querySelector(".section-header").innerHTML = "";
  else sectionLi.querySelector(".section-name").textContent = name;

  const addSectionBtn = sectionLi.querySelector(".add-section-btn");
  addSectionBtn.dataset.idx = `${idx + 1}`;
  addSectionBtn.addEventListener("click", () => {
    sectionLi.appendChild(addSectionForm);
    addSectionForm.style.display = "flex";
    addSectionForm.dataset.idx = addSectionBtn.dataset.idx;
    addSectionBtn.style.display = "none";
  });

  const addTodoBtn = sectionLi.querySelector(".add-todo-btn");
  addTodoBtn.addEventListener("click", () => {
    addTodoBtn.closest("li").appendChild(inlineForm);
    inlineForm.style.display = "block";
    inlineForm.querySelector(".todo-title-input").focus();
    inlineForm.querySelector(".project-selector").value =
      addTodoBtn.dataset.project;
    main.querySelectorAll(".add-todo-btn").forEach((btn) => {
      btn.style.display = "none";
    });
  });
  const tasksList = sectionLi.querySelector(".tasks-list");

  section.todos.forEach((todo, idx) => {
    createTodo(tasksList, todo, section, idx);
  });

  addTodoBtn.dataset.project = `${curProject}/${curProjectIndex}/${name}/${
    name ? idx - 1 : ""
  }`;

  for (let i = idx + 1; i < sectionsList.children.length; i++) {
    const addSectionBtn1 =
      sectionsList.children[i].querySelector(".add-section-btn");
    addSectionBtn1.dataset.idx = `${i + 1}`;
    const addTodoBtn1 = sectionsList.children[i].querySelector(".add-todo-btn");
    const prevProject = addTodoBtn1.dataset.project;
    addTodoBtn1.dataset.project =
      prevProject.substring(0, prevProject.lastIndexOf("/") + 1) + (i - 1);
  }
}

function createTodo(project, todo, todoContainer, idx) {
  const div = document.createElement("div");
  div.innerHTML = todoHTML;
  project.insertBefore(div.firstElementChild, project.children[idx]);

  const todoElement = project.children[idx];
  const checkBox = todoElement.querySelector(".checkbox");
  if (todo.priority < 4) {
    checkBox.classList.add(`checkbox-p${todo.priority}`);
  }

  todoElement.querySelector(".todo-title").textContent = todo.title;
  todoElement.querySelector(".todo-desc").textContent = todo.description;

  const today = new Date();
  const nextWeek = addDays(today, 7);
  const nextWeekEnd = endOfDay(nextWeek);
  if (todo.dueDate) {
    todoElement.querySelector(".due-date").insertAdjacentHTML(
      "afterbegin",
      `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" class="calendar_icon" > <path fill-rule="evenodd" clip-rule="evenodd" d="M9.5 1h-7A1.5 1.5 0 001 2.5v7A1.5 1.5 0 002.5 11h7A1.5 1.5 0 0011 9.5v-7A1.5 1.5 0 009.5 1zM2 2.5a.5.5 0 01.5-.5h7a.5.5 0 01.5.5v7a.5.5 0 01-.5.5h-7a.5.5 0 01-.5-.5v-7zM8.75 8a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM3.5 4a.5.5 0 000 1h5a.5.5 0 000-1h-5z" fill="currentColor" ></path> </svg>
`
    );
    let date;
    if (isToday(todo.dueDate)) {
      date = "Today";
      todoElement.querySelector(".due-date").classList.add("today");
    } else if (isTomorrow(todo.dueDate)) {
      date = "Tomorrow";
      todoElement.querySelector(".due-date").classList.add("tomorrow");
    } else if (
      isWithinInterval(todo.dueDate, { start: today, end: nextWeekEnd })
    ) {
      date = format(todo.dueDate, "EEEE");
      todoElement.querySelector(".due-date").classList.add("this-week");
    } else {
      date = format(todo.dueDate, "dd MMM yyyy");
    }

    todoElement.querySelector(".due-date span").textContent = date;
  }

  if (todo.dueTime) {
    const time = new Intl.DateTimeFormat(navigator.language, {
      hour: "numeric",
      minute: "numeric",
    }).format(todo.dueDate);

    todoElement.querySelector(".due-date span:last-child").textContent = time;
  }

  const checkBoxBtn = todoElement.querySelector(".checkbox-container");
  checkBoxBtn.addEventListener("click", () => {
    todo.completed = true;
    todo.project.completeTodo(todo.project.todos.indexOf(todo));
    console.log(todoContainer);
    todoElement.classList.add("removed");
  });
  todoElement.addEventListener("transitionend", (e) => {
    if (e.target === todoElement) todoElement.remove();
  });
}

window.addEventListener("load", () => {
  populateProjectSelectorOptions();
  createSectionDOM("", 0, TodoList.projects[0]);
});

inlineForm.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    inlineForm.querySelector(".cancel-btn").click();
  } else if (e.key === "Enter") {
    inlineForm.querySelector(".add-task-btn").click();
  }
});

const sectionNameInput = addSectionForm.querySelector(
  'input[name="section-name"]'
);

sectionNameInput.addEventListener("input", (e) => {
  if (sectionNameInput.value) {
    addSectionForm.querySelector(".add-section-confirm").disabled = false;
  } else {
    addSectionForm.querySelector(".add-section-confirm").disabled = true;
  }
});

const addSectionConfirm = addSectionForm.querySelector(".add-section-confirm");
addSectionConfirm.addEventListener("click", (e) => {
  e.preventDefault();
  const sectionName = sectionNameInput.value;
  const idx = +addSectionConfirm.form.dataset.idx;
  const section = TodoList.projects[curProjectIndex].addSection(
    sectionName,
    idx - 1
  );
  createSectionDOM(sectionName, idx, section);
  populateProjectSelectorOptions();
  addSectionConfirm.form.previousElementSibling.style.display = "";
  addSectionConfirm.form.style.display = "none";
  addSectionConfirm.form.remove();
  addSectionConfirm.disabled = true;
  addSectionConfirm.form.querySelector('input[name="section-name"]').value = "";
});

const cancelAddSection = addSectionForm.querySelector(".cancel-section");
cancelAddSection.addEventListener("click", (e) => {
  e.preventDefault();
  cancelAddSection.previousElementSibling.disabled = true;
  cancelAddSection.form.previousElementSibling.style.display = "";
  cancelAddSection.form.style.display = "none";
  cancelAddSection.form.firstElementChild.value = "";
});

cancelAddSection.form.firstElementChild.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    cancelAddSection.click();
  }
});

const leftMenu = document.querySelector("#sidebar > ul:first-of-type");
leftMenu.addEventListener("click", (e) => {
  let clicked = e.target;
  if (clicked) {
    clicked = clicked.closest("li");
  } else return;
  if (clicked.id === "inbox") {
    main.firstElementChild.firstElementChild.textContent =
      TodoList.projects[0].name;
    sectionsList.innerHTML = "";
    curProjectIndex = 0;
    curProject = "Inbox";
    createSectionDOM("", 0, TodoList.projects[0]);
    TodoList.projects[0].sections.forEach((section, idx) => {
      createSectionDOM(section.name, idx + 1, section);
    });
  } else if (clicked.id === "today") {
    main.firstElementChild.firstElementChild.textContent =
      "Today " + format(startOfToday(), "EEE dd MMM");
    sectionsList.innerHTML = "";
    const Todocontainer = new TodoContainer("today");
    TodoList.projects.forEach((project) => {
      project.todos.forEach((todo) => {
        if (isToday(todo.dueDate)) {
          Todocontainer.addTodo(todo);
        }
      });

      project.sections.forEach((section) => {
        section.todos.forEach((todo) => {
          if (isToday(todo.dueDate)) {
            Todocontainer.addTodo(todo);
          }
        });
      });
    });
    console.log(Todocontainer);
    createSectionDOM("", 0, Todocontainer);
  }
});
