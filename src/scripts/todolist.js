import Project from "./project.js";
import "../style.css";

const TodoList = (() => {
  const projects = [new Project("inbox")];

  const addProject = (project) => {
    projects.push(project);
  };

  const removeProject = (index) => {
    projects.splice(index, 1);
  };

  return { projects, addProject, removeProject };
})();

export default TodoList;
