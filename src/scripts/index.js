import TodoList from "./todolist.js";
import Todo from "./todos.js";
import { Project, TodoContainer } from "./project.js";

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

console.log(TodoList.projects);

const main = document.querySelector("main");
window.addEventListener("load", () => {
  main.querySelector("#main-header h1").textContent = TodoList.projects[0].name;
});
const sidebar = document.querySelector("nav#sidebar");

const addTodoBtns = document.querySelectorAll(".add-todo-btn");
const inlineForm = document.querySelector(".inline-form");

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (inlineForm.previousElementSibling.classList.contains("add-todo-btn")) {
      addTodoBtns.forEach((btn) => {
        btn.style.display = "flex";
      });
    }
    inlineForm.style.display = "none";
    inlineForm.remove();
  }
});

addTodoBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    btn.closest("li").appendChild(inlineForm);
    inlineForm.style.display = "block";
    inlineForm.querySelector(".todo-title-input").focus();
    addTodoBtns.forEach((btn) => {
      btn.style.display = "none";
    });
  });
});
