import { Project } from "./project.js";
import "../style.css";

const TodoList = {
  numProjects: 0,
  projects: [new Project("Inbox")],

  addProject(project) {
    project.num = ++numProjects;
    this.projects.push(project);
  },

  removeProject(index) {
    this.projects.splice(index, 1);
  },
};

export default TodoList;
