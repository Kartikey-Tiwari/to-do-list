import { Project } from "./project.js";
import "../style.css";

const TodoList = {
  projects: [new Project("Inbox")],

  addProject(project) {
    this.projects.push(project);
  },

  removeProject(index) {
    this.projects.splice(index, 1);
  },
};

export default TodoList;
