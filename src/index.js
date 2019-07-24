import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import expect from "expect";
import deepFreeze from "deep-freeze";
import { createStore, combineReducers } from "redux";
import PropTypes from "prop-types";
import { Provider, connect } from "react-redux";

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
const Link = ({ active, children, onClick }) => {
	if (active) {
		return <span>{children}</span>;
	}
	return (
		<a
			href="/#"
			onClick={e => {
				e.preventDefault();
				onClick();
			}}
		>
			{children}
		</a>
	);
};

// Container component
class FilterLink extends React.Component {
	componentDidMount() {
		const { store } = this.context;
		this.unsubscribe = store.subscribe(() => {
			this.forceUpdate();
		});
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	render() {
		const props = this.props;
		const { store } = this.context;
		const state = store.getState();
		return (
			<Link
				active={props.filter === state.visibilityFilter}
				onClick={() =>
					store.dispatch({
						type: "SET_VISIBILITY_FILTER",
						filter: props.filter
					})
				}
			>
				{props.children}
			</Link>
		);
	}
}
FilterLink.contextTypes = {
	store: PropTypes.object
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

/** Presentational component
 * 1> functional component -> first argument = props
 * second argument = props
 * 2> 
 */
let AddTodo = ({ dispatch }) => {
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
					dispatch({
						type: "ADD_TODO",
						id: nextTodoId++,
						text: input.value
					});
					input.value = "";
				}}
			>
				Add Todo
			</button>
		</div>
	);
};
// AddTodo.contextTypes = {
// 	store: PropTypes.object
// };

/** AddTodo Container component
 * 1> first argument => state that returns props
 * 2> second argument => callback that returns dispatch
 */
AddTodo = connect(
	state => {
		return {};
	},
	dispatch => {
		return {dispatch};
	}
)(AddTodo);

/** AddTodo Container component
 * 1> no need to subscribe to the store as the component doesn't 
 * need any props
 * 2> second argument => callback that returns dispatch
 */
AddTodo = connect(
	null,
	dispatch => {
		return {dispatch};
	}
)(AddTodo);

/** AddTodo Container component
 * 1> no need to subscribe to the store as the component doesn't 
 * need any props
 * 2> second argument => returning null or an empty object is fine as
 * connect automatically injects dispatch in the container component
 */

AddTodo = connect(
	null,
	null || {}
)(AddTodo);

AddTodo = connect()(AddTodo);



// presentational component
const Footer = () => {
	return (
		<p>
			Show: <FilterLink filter="SHOW_ALL">All</FilterLink>{" "}
			<FilterLink filter="SHOW_ACTIVE">Active</FilterLink>{" "}
			<FilterLink filter="SHOW_COMPLETED">Completed</FilterLink>
		</p>
	);
};

// class VisibleTodoList extends React.Component {
// 	componentDidMount() {
// 		const { store } = this.context;
// 		this.unsubscribe = store.subscribe(() => {
// 			this.forceUpdate();
// 		});
// 	}

// 	componentWillUnmount() {
// 		this.unsubscribe();
// 	}

// 	render() {
// 		const props = this.props;
// 		const { store } = this.context;
// 		const state = store.getState();
// 		return (
// 			<TodoList
// 				todos={getVisibleTodos(state.todos, state.visibilityFilter)}
// 				onTodoClick={id =>
// 					store.dispatch({
// 						type: "TOGGLE_TODO",
// 						id
// 					})
// 				}
// 			/>
// 		);
// 	}
// }
// VisibleTodoList.contextTypes ={
// 	store: PropTypes.object
// };

/**
 * mapStateToProps => maps the store state to the props of the
 *  Presentational Component calculated from it. This props will
 * be updated any time the state changes.
 */
const mapStateToTodoListProps = state => {
	return {
		todos: getVisibleTodos(state.todos, state.visibilityFilter)
	};
};

/**
 * mapDispatchToProps =>
 * 1> takes the store's dispatch method as the first argument.
 * 2> returns the props that use the dispatch method to dispatch actions
 */
const mapDispatchToTodoListProps = dispatch => {
	return {
		onTodoClick: id => {
			return dispatch({
				type: "TOGGLE_TODO",
				id
			});
		}
	};
};

/** connect function => generate the container component
 * 1> mapStateToProps as the first argument
 * 2> mapDispatchToProps as the second argument
 * 3> presentational component that passed an argument to curried
 * function CONNECT
 */
const VisibleTodoList = connect(
	mapStateToTodoListProps,
	mapDispatchToTodoListProps
)(TodoList);

let nextTodoId = 0;
// container component
const TodoApp = () => {
	return (
		<div>
			<AddTodo />
			<VisibleTodoList />
			<Footer />
		</div>
	);
};

/** polyfill for provider component in react-redux */
// class Provider extends React.Component {
// 	getChildContext() {
// 		return {
// 			store:  this.props.store
// 		};
// 	}
// 	render() {
// 		return this.props.children;
// 	}
// }
// Provider.childContextTypes = {
// 	store: PropTypes.object
// };

ReactDOM.render(
	<Provider store={createStore(todoApp)}>
		<TodoApp />
	</Provider>,
	document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
