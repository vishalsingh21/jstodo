var todos = ['Go to market', 'Buy some fruit', 'Get some milk'];


var todo = oojs.createTodo('todo');

todos.forEach(function(todoTitle, index, array) {
	todo.list.addTodo(todoTitle);
});


