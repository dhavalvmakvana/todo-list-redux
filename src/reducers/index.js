import { todos } from './todos';
import { visibilityFilter } from './visibilityFilter';
import { combineReducers } from 'redux';

export const todoApp = combineReducers({
    todos,
    visibilityFilter
})