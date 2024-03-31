import { useState, useEffect } from "react";
import "../css/dashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faAnglesRight,
  faCircleCheck,
  faCalendarDays,
  faNoteSticky,
  faUser,
  faBriefcase,
  faPlus,
  faSliders,
  faTimes,
  faArrowRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { auth, db } from "../auth/firebase";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

let taskIdCounter = 1;

class Task {
  constructor(title, description, dueDate, category) {
    this.id = taskIdCounter;
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.category = category;
  }
}

function MenuList({ text, icon, color, handleMenuClick }) {
  return (
    <li onClick={() => handleMenuClick(text)}>
      <FontAwesomeIcon icon={icon} style={{ color: color }} /> {text}
    </li>
  );
}

function TaskList({ tasks, handleTaskClick, del }) {
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          <div className="newtask">
            <input type="checkbox" onClick={() => del(task)} />
            <span onClick={() => handleTaskClick(task)}>{task.title}</span>
          </div>
          <div className="line"></div>
        </li>
      ))}
    </ul>
  );
}

function Dashboard() {
  const [selectedTaskList, setSelectedTaskList] = useState("Today");
  const [task, setTask] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("personal");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [viewTaskVisible, setViewTaskVisible] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tasks"), (querySnapshot) => {
      const tasksData = [];
      querySnapshot.forEach((doc) => {
        tasksData.push({ id: doc.id, ...doc.data() });
      });
      setTasks(tasksData);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setTask(task.title);
    setDescription(task.description);
    setCategory(task.category);
    setDueDate(task.dueDate);
    setViewTaskVisible(true);
  };

  const handleMenuClick = (text) => {
    setSelectedTaskList(text);
  };

  const toggleViewTask = () => {
    setViewTaskVisible(!viewTaskVisible);
    setSelectedTask(null);
    setTask("");
    setDescription("");
    setCategory("personal");
    setDueDate(new Date().toISOString().slice(0, 10));
  };

  const save = () => {
    if (
      task === "" ||
      description === "" ||
      dueDate === "" ||
      category === ""
    ) {
      alert("Please fill in all fields");
      return;
    } else if (dueDate < new Date().toISOString().slice(0, 10)) {
      alert("Please enter a valid date");
      return;
    }

    if (selectedTask) {
      const taskRef = doc(db, "tasks", selectedTask.id);
      updateDoc(taskRef, {
        title: task,
        description: description,
        dueDate: dueDate,
        category: category,
      });
    } else {
      const newTaskRef = addDoc(collection(db, "tasks"), {
        title: task,
        description: description,
        dueDate: dueDate,
        category: category,
      });
    }

    toggleViewTask();
  };

  const del = async (taskToDelete) => {
    const taskRef = doc(db, "tasks", taskToDelete.id);
    await deleteDoc(taskRef);
    toggleViewTask();
  };

  const signout = () => {
    auth.signOut();
    navigate("/");
  };

  const todayTasks = tasks.filter(
    (task) => task.dueDate === new Date().toISOString().slice(0, 10)
  );
  const upcomingTasks = tasks
    .filter(
      (task) => task.dueDate > new Date().toISOString().slice(0, 10)
    )
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return (
    <>
      <div className="app">
        <div className="dashboard">
          <div className="menu">
            <div className="header">
              <h3>Menu</h3>
              <FontAwesomeIcon icon={faMagnifyingGlass} className="mag" />
              <form
                onSubmit={(e) => e.preventDefault()}
                role="search"
                id="form"
              >
                <input
                  id="search"
                  type="search"
                  placeholder="Search..."
                  autoFocus
                  required
                />
                <button type="submit">Go</button>
              </form>
            </div>
            <div className="task">
              <label>Tasks</label>
              <ul>
                <MenuList
                  text="Upcoming"
                  icon={faAnglesRight}
                  color="blue"
                  handleMenuClick={handleMenuClick}
                />
                <MenuList
                  text="Today"
                  icon={faCircleCheck}
                  color="green"
                  handleMenuClick={handleMenuClick}
                />
                <MenuList
                  text="Calendar"
                  icon={faCalendarDays}
                  color="red"
                  handleMenuClick={handleMenuClick}
                />
                <MenuList
                  text="Sticky Wall"
                  icon={faNoteSticky}
                  color="orange"
                  handleMenuClick={handleMenuClick}
                />
              </ul>
            </div>
            <div className="lists">
              <label>Lists</label>
              <ul>
                <MenuList text="Personal" icon={faUser} color="purple" />
                <MenuList text="Work" icon={faBriefcase} color="grey" />
                <li>
                  <FontAwesomeIcon icon={faPlus} /> Add New List
                </li>
              </ul>
            </div>
            <div className="footer">
              <li>
                <FontAwesomeIcon icon={faSliders} color="Darkblue" />
                Settings
              </li>
              <li>
                <FontAwesomeIcon icon={faArrowRightFromBracket} color="red" />
                <span onClick={signout}>Sign Out</span>
              </li>
            </div>
          </div>
          <div className="details">
            {selectedTaskList === "Today" && (
              <div className="today">
                <h1>Today</h1>
                <button className="sub" onClick={toggleViewTask}>
                  Add New Task
                </button>
                <div className="newtask">
                  <TaskList
                    tasks={todayTasks}
                    handleTaskClick={handleTaskClick}
                    del={del}
                  />
                </div>
              </div>
            )}
            {selectedTaskList === "Upcoming" && (
              <div className="today">
                <h1>Upcoming</h1>
                <button className="sub" onClick={toggleViewTask}>
                  Add New Task
                </button>
                <div className="newtask">
                  <TaskList
                    tasks={upcomingTasks}
                    handleTaskClick={handleTaskClick}
                    del={del}
                  />
                </div>
              </div>
            )}
          </div>
          <div className={`viewtask ${viewTaskVisible ? "visible" : "hidden"}`}>
            <div className="top">
              <h2>Task</h2>
              <button className="close-button" onClick={toggleViewTask}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="taskarea">
              <input
                type="text"
                placeholder="task"
                className="intext"
                value={task}
                onChange={(e) => setTask(e.target.value)}
              />
              <input
                type="text"
                placeholder="description"
                className="intext"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <form action="">
                <div>
                  <div className="input">
                    <span>List</span>
                    <select
                      name="category"
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="personal">Personal</option>
                      <option value="work">Work</option>
                    </select>
                  </div>
                  <div className="input">
                    <span>Date</span>
                    <input
                      type="date"
                      name="date"
                      id="date"
                      value={dueDate}
                      disabled={selectedTaskList === "Today"}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>
              </form>
            </div>
            <div className="buttons">
              <button id="del" onClick={() => del(selectedTask)}>
                Delete
              </button>
              <button id="save" onClick={save}>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
