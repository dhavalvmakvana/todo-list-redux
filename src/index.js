import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import expect from "expect";
import deepFreeze from "deep-freeze";
import { createStore, combineReducers } from "redux";

const todo = (state, action) => {
	switch (action.type) {
		case "ADD_TODO":
			return {
				id: action.id,
				text: action.text,
				completed: false
			};
		case "TOGGLE_TODO":
			if (state.id !== action.id) {
				return state;
			}
			return {
				...state,
				completed: !state.completed
			};
		default:
			return state;
	}
};

const todos = (state = [], action) => {
	switch (action.type) {
		case "ADD_TODO":
			return [...state, todo(undefined, action)];
		case "TOGGLE_TODO":
			return state.map(t => todo(t, action));
		default:
			return state;
	}
};

const visibilityFilter = (state = "SHOW_ALL", action) => {
	switch (action.type) {
		case "SET_VISIBILITY_FILTER":
			return action.filter;
		default:
			return state;
	}
};

// const todoApp = (state = {}, action) => {
//     return {
//         todos: todos(state.todos, action),
//         visibilityFilter: visibilityFilter(state.visibilityFilter, action)
//     }
// };

// const todoApp = combineReducers({
//     todos: todos,
//     visibilityFilter: visibilityFilter
// });

const todoApp = combineReducers({
	todos,
	visibilityFilter
});

const store = createStore(todoApp);
console.log(store.getState());

const testAddTodo = () => {
	const stateBefore = [];
	const action = {
		type: "ADD_TODO",
		id: 0,
		text: "Learn Redux"
	};
	const stateAfter = [
		{
			id: 0,
			text: "Learn Redux",
			completed: false
		}
	];

	deepFreeze(stateBefore);
	deepFreeze(action);

	expect(todos(stateBefore, action)).toEqual(stateAfter);
};

const testToggleTodo = () => {
	const stateBefore = [
		{
			id: 0,
			text: "Learn Redux",
			completed: false
		},
		{
			id: 1,
			text: "Go Shopping",
			completed: false
		}
	];
	const action = {
		type: "TOGGLE_TODO",
		id: 1
	};
	const stateAfter = [
		{
			id: 0,
			text: "Learn Redux",
			completed: false
		},
		{
			id: 1,
			text: "Go Shopping",
			completed: true
		}
	];

	deepFreeze(stateBefore);
	deepFreeze(action);

	expect(todos(stateBefore, action)).toEqual(stateAfter);
};

testAddTodo();
testToggleTodo();
console.log("All tests passed.");

const getVisibleTodos = (todos, filter) => {
	switch (filter) {
		case "SHOW_ALL":
			return todos;
		case "SHOW_ACTIVE":
			return todos.filter(t => !t.completed);
		case "SHOW_COMPLETED":
			return todos.filter(t => t.completed);
		default:
			return todos;
	}
};

// presentational component
const FilterLink = ({ filter, children, currentFilter, onClick }) => {
	if (filter === currentFilter) {
		return <span>{children}</span>;
	}
	return (
		<a
			href="/#"
			onClick={e => {
				e.preventDefault();
				onClick(filter);
			}}
		>
			{children}
		</a>
	);
};

// presentational component
const Todo = ({ onClick, completed, text }) => {
	return (
		<li
			onClick={onClick}
			style={{
				textDecoration: completed ? "line-through" : "none"
			}}
		>
			{text}
		</li>
	);
};

// presentational component
const TodoList = ({ todos, onTodoClick }) => {
	return (
		<ul>
			{todos.map(todo => {
				return (
					<Todo key={todo.id} {...todo} onClick={() => onTodoClick(todo.id)} />
				);
			})}
		</ul>
	);
};

//presentational component
const AddTodo = ({ onAddClick }) => {
	let input;

	return (
		<div>
			<input
				ref={node => {
					input = node;
				}}
			/>
			<button
				onClick={() => {
					onAddClick(input.value);
					input.value = "";
				}}
			>
				Add Todo
			</button>
		</div>
	);
};

// presentational component
const Footer = ({ visibilityFilter, onFilterClick }) => {
	return (
		<p>
			Show:{" "}
			<FilterLink
				filter="SHOW_ALL"
				currentFilter={visibilityFilter}
				onClick={onFilterClick}
			>
				All
			</FilterLink>{" "}
			<FilterLink
				filter="SHOW_ACTIVE"
				currentFilter={visibilityFilter}
				onClick={onFilterClick}
			>
				Active
			</FilterLink>{" "}
			<FilterLink
				filter="SHOW_COMPLETED"
				currentFilter={visibilityFilter}
				onClick={onFilterClick}
			>
				Completed
			</FilterLink>
		</p>
	);
};

let nextTodoId = 0;
// container component
const TodoApp = ({ todos, visibilityFilter }) => {
	return (
		<div>
			<AddTodo
				onAddClick={text =>
					store.dispatch({
						type: "ADD_TODO",
						id: nextTodoId++,
						text
					})
				}
			/>
			<TodoList
				todos={getVisibleTodos(todos, visibilityFilter)}
				onTodoClick={id => {
					store.dispatch({
						type: "TOGGLE_TODO",
						id
					});
				}}
			/>
			<Footer
				visibilityFilter={visibilityFilter}
				onFilterClick={filter =>
					store.dispatch({
						type: "SET_VISIBILITY_FILTER",
						filter
					})
				}
			/>
		</div>
	);
};

const render = () => {
	ReactDOM.render(
		<TodoApp {...store.getState()} />,
		document.getElementById("root")
	);
};

store.subscribe(render);
render();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
