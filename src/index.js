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

let nextTodoId = 0;

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

const FilterLink = ({ filter, children, currentFilter }) => {
	if (filter === currentFilter) {
		return <span>{children}</span>;
	}
	return (
		<a
			href="/#"
			onClick={e => {
				e.preventDefault();
				store.dispatch({
					type: "SET_VISIBILITY_FILTER",
					filter
				});
			}}
		>
			{children}
		</a>
	);
};

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

class TodoApp extends React.Component {
	render() {
		const { todos, visibilityFilter } = this.props;
		const visibleTodos = getVisibleTodos(todos, visibilityFilter);
		return (
			<div>
				<input
					ref={node => {
						this.input = node;
					}}
				/>
				<button
					onClick={() => {
						store.dispatch({
							type: "ADD_TODO",
							text: this.input.value,
							id: nextTodoId++
						});
						this.input.value = "";
					}}
				>
					Add Todo
				</button>
				<TodoList
					todos={visibleTodos}
					onTodoClick={id => {
						store.dispatch({
							type: "TOGGLE_TODO",
							id
						});
					}}
				/>
				<p>
					Show:{" "}
					<FilterLink filter="SHOW_ALL" currentFilter={visibilityFilter}>
						All
					</FilterLink>{" "}
					<FilterLink filter="SHOW_ACTIVE" currentFilter={visibilityFilter}>
						Active
					</FilterLink>{" "}
					<FilterLink filter="SHOW_COMPLETED" currentFilter={visibilityFilter}>
						Completed
					</FilterLink>
				</p>
			</div>
		);
	}
}

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
