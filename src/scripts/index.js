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

import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";

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

function savedTodoLocalStorage() {
  const jsonString = JSON.stringify(TodoList, (key, value) => {
    if (key === "_project") {
      return "";
    }
    return value;
  });
  localStorage.setItem("todoList", jsonString);
}

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
    const projectIdx = projectData[0];
    const sectionIdx = projectData[1];

    let todoContainer;
    if (sectionIdx === "") {
      todoContainer = TodoList.projects[+projectIdx];
    } else {
      todoContainer = TodoList.projects[+projectIdx].sections[+sectionIdx];
    }

    const todo = new Todo(
      title,
      desc,
      date ? new Date(date + " " + time) : null,
      time ? true : false,
      +priority,
      sectionIdx
        ? TodoList.projects[+projectIdx].sections[+sectionIdx]
        : TodoList.projects[+projectIdx],
      false
    );

    const idx = todoContainer.addTodo(todo);
    savedTodoLocalStorage();

    if (+projectIdx === curProjectIndex) {
      const i = sectionIdx ? +sectionIdx + 1 : 0;
      createTodo(
        sectionsList.children[i].querySelector(".tasks-list"),
        todo,
        idx
      );
    } else if (curProjectIndex === -1) {
      if (todo.dueDate && isToday(todo.dueDate)) {
        const idx = todayTodos.addTodo(todo);
        createTodo(
          sectionsList.children[0].querySelector(".tasks-list"),
          todo,
          idx
        );
      }
    }

    const p = +priority;
    if (date)
      calendar.addEvent({
        title,
        start: date + " " + time,
        end: date + " " + time,
        borderColor:
          p === 1
            ? "rgb(209, 69, 59)"
            : p === 2
            ? "rgb(235, 137, 9)"
            : p === 3
            ? "rgb(36, 111, 224)"
            : "rgb(0,0,0)",
        backgroundColor:
          p === 1
            ? "rgba(209, 69, 59, 0.1)"
            : p === 2
            ? "rgba(235, 137, 9, 0.1)"
            : p === 3
            ? "rgba(36, 111, 224, 0.1)"
            : "rgb(255,255,255)",
      });
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
const todayTodos = new Project("Today");
const saved = localStorage.getItem("todoList");
const projectHTML = `
            <li>
              <a href="#" class="li-a">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  class="project_icon"
                  style="color: rgb(184, 184, 184)"
                >
                  <path
                    d="M12 7a5 5 0 110 10 5 5 0 010-10z"
                    fill="currentColor"
                  ></path>
                </svg>
                <span class="project-name"></span>
              </a>
              <div class="project-todo-count">
                <span>0</span>
              </div>
            </li>
`;

const addProjectBtn = document.querySelector(".add-project-btn");
const addProjectForm = document.querySelector(".add-project-form");
const projectContainer = document.querySelector("#projects-container ul");

if (saved) {
  const savedTodoList = JSON.parse(saved);

  TodoList.projects = savedTodoList.projects.map((project) => {
    return Object.assign(new Project(), project);
  });

  TodoList.projects.forEach((project) => {
    createProjectDOM(project);
    project.sections = project.sections.map((section) => {
      return Object.assign(new TodoContainer(), section);
    });

    project.sections.forEach((section) => {
      section.todos = section.todos.map((todo) => {
        todo._dueDate = todo._dueDate ? new Date(todo._dueDate) : todo._dueDate;
        todo._project = section;
        const newTodo = Object.assign(new Todo(), todo);
        if (isToday(newTodo.dueDate)) todayTodos.addTodo(newTodo);
        return newTodo;
      });

      section.completedTodos = section.completedTodos.map((todo) => {
        todo._dueDate = todo._dueDate ? new Date(todo._dueDate) : todo._dueDate;
        todo._project = section;
        const newTodo = Object.assign(new Todo(), todo);
        return newTodo;
      });
    });

    project.todos = project.todos.map((todo) => {
      todo._dueDate = todo._dueDate ? new Date(todo._dueDate) : todo._dueDate;
      todo._project = project;
      const newTodo = Object.assign(new Todo(), todo);
      if (isToday(newTodo.dueDate)) todayTodos.addTodo(newTodo);
      return newTodo;
    });
  });
}

function populateProjectSelectorOptions() {
  const projectSelector = document.querySelectorAll(".project-selector");
  projectSelector.forEach((selector) => {
    selector.innerHTML = "";
  });
  TodoList.projects.forEach((project, projectIdx) => {
    const option = document.createElement("option");
    option.value = projectIdx + "/";
    option.textContent = project.name;
    projectSelector.forEach((selector) => {
      selector.appendChild(option.cloneNode(true));
    });
    project.sections.forEach((section, sectionIdx) => {
      const option = document.createElement("option");
      option.value = `${projectIdx}/${sectionIdx}`;
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

const calendarEl = main.querySelector("#calendar");

let calendar = new Calendar(calendarEl, {
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin],
  initialView: "dayGridMonth",
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,dayGridWeek,listWeek",
  },
});
calendar.render();
calendarEl.style.display = "none";

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
    addSectionForm.querySelector("input").focus();
  });

  const addTodoBtn = sectionLi.querySelector(".add-todo-btn");
  addTodoBtn.addEventListener("click", () => {
    addTodoBtn.closest("li").appendChild(inlineForm);
    const dateInputBtn = inlineForm.querySelector(".duedate-input");
    inlineForm.querySelector(".project-selector").value =
      addTodoBtn.dataset.project;
    if (curProject === "Today") {
      dateInputBtn.lastElementChild.textContent = "Today";
      dateInputBtn.classList.add("today");
      dateInputBtn.nextElementSibling.value = new Date()
        .toISOString()
        .slice(0, 10);
      dateInputBtn.nextElementSibling.nextElementSibling.disabled = false;
      inlineForm.querySelector(".project-selector").value = "0/";
    } else {
      dateInputBtn.lastElementChild.textContent = "Date";
      dateInputBtn.classList.remove("today");
      dateInputBtn.nextElementSibling.value = "";
      dateInputBtn.nextElementSibling.nextElementSibling.disabled = true;
    }
    inlineForm.style.display = "block";
    inlineForm.querySelector(".todo-title-input").focus();
    main.querySelectorAll(".add-todo-btn").forEach((btn) => {
      btn.style.display = "none";
    });
  });
  const tasksList = sectionLi.querySelector(".tasks-list");

  section.todos.forEach((todo, idx) => {
    createTodo(tasksList, todo, idx);
  });

  addTodoBtn.dataset.project = `${curProjectIndex}/${name ? idx - 1 : ""}`;

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

function createTodo(projectElement, todo, idx) {
  const div = document.createElement("div");
  div.innerHTML = todoHTML;
  projectElement.insertBefore(
    div.firstElementChild,
    projectElement.children[idx]
  );

  const todoElement = projectElement.children[idx];
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
    todoElement.classList.add("removed");
  });
  todoElement.addEventListener("transitionend", (e) => {
    if (e.target === todoElement) todoElement.remove();
  });
}

window.addEventListener("load", () => {
  populateProjectSelectorOptions();
  renderProject(TodoList.projects[0]);
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
  savedTodoLocalStorage();
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
    renderProject(TodoList.projects[0]);
  } else if (clicked.id === "today") {
    if (curProjectIndex !== -1) {
      renderProject(todayTodos);
      main.firstElementChild.firstElementChild.textContent =
        "Today " + format(startOfToday(), "EEE dd MMM");
    }
  } else if (clicked.id === "upcoming") {
    main.firstElementChild.firstElementChild.textContent = "";
    calendarEl.style.display = "block";
    calendar.render();
  }
});

addProjectBtn.addEventListener("click", () => {
  addProjectForm.style.display = "flex";
  projectContainer.append(addProjectForm);
  addProjectForm.querySelector("input").focus();
});

const projectNameInput = addProjectForm.querySelector("input");
const addProjectConfirm = addProjectForm.querySelector(".add-project-confirm");

projectNameInput.addEventListener("input", (e) => {
  if (projectNameInput.value) {
    addProjectConfirm.disabled = false;
  } else {
    addProjectConfirm.disabled = true;
  }
});

function renderProject(project) {
  calendarEl.style.display = "none";
  main.firstElementChild.firstElementChild.textContent = project.name;
  sectionsList.innerHTML = "";
  curProjectIndex = TodoList.projects.indexOf(project);
  curProject = project.name;
  createSectionDOM("", 0, project);
  project.sections.forEach((section, idx) => {
    createSectionDOM(section.name, idx + 1, section);
  });
}

function createProjectDOM(project) {
  const div = document.createElement("div");
  div.insertAdjacentHTML("afterbegin", projectHTML);
  const projectEl = div.firstElementChild;
  projectEl.querySelector(".project-name").textContent = project.name;
  projectContainer.append(projectEl);
  projectEl.addEventListener("click", () => {
    renderProject(project);
  });
}

addProjectConfirm.addEventListener("click", (e) => {
  e.preventDefault();
  const projectName = projectNameInput.value;
  if (!projectName) return;
  const project = new Project(projectName);
  TodoList.addProject(project);

  savedTodoLocalStorage();
  createProjectDOM(project);
  populateProjectSelectorOptions();
  addProjectConfirm.form.style.display = "none";
  addProjectConfirm.form.remove();
  addProjectConfirm.disabled = true;
  projectNameInput.value = "";
});

const cancelAddProject = addProjectForm.querySelector(".add-project-cancel");
cancelAddProject.addEventListener("click", (e) => {
  e.preventDefault();
  cancelAddProject.previousElementSibling.disabled = true;
  cancelAddProject.form.style.display = "none";
  projectNameInput.value = "";
});

projectNameInput.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    cancelAddProject.click();
  }
});
