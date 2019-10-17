var oojs = (function(oojs) {

	// Get the ID for new Todo Item
	var getId = (function() {
		var i = 1;
		return function() {
			return 't' + (i++);
		};
	}());

	// Todo Item Constructor Function
	var TodoItem = function(todoTitle) {
		EventTarget.call(this);
		
		Object.defineProperties(this, {
			__el: {
				value: document.createElement('LI')
			},
			title: {
				value: todoTitle,
				writable: true
			},
			completed: {
				value: false,
				writable: true
			}
		});
		this.bindEvents();
		this.buildHTML();
	};
	TodoItem.prototype = Object.create(EventTarget.prototype, {
		bindEvents: {
			value: function() {

				this.__el.addEventListener('click', function(evt) {
					// User click on cross button to delete todo
					if(evt.target.classList.contains('delete-todo')) {
						this.__fire({
							type: 'tododeleted'
						});
					}
				}.bind(this));

				this.__el.addEventListener('change', function(evt) {
					// user click on checkbox to complete todo 
					if(evt.target.classList.contains('mark-complete')) {
						this.completed = evt.target.checked;
						this.__fire({
							type: 'todocompleted'
						});
					}
				}.bind(this));

				this.__el.addEventListener('dblclick', function(evt) {
					// User double click on todo label for editing
					if(evt.target.classList.contains('todo-label')){
						this.editTodo();
					}
				}.bind(this));

				this.__el.addEventListener('blur', function(evt) {
					// User lose focus from edit todo field
					if(evt.target.classList.contains('edit-todo')) {
						this.editDone(evt.target.value);
					}
				}.bind(this));

				this.__el.addEventListener('keyup', function(evt) {
					// User enter ESC or Enter key on edit todo field
					if(evt.target.classList.contains('edit-todo')) {
						// If user press ESC key
						if(evt.keyCode === 27) {
							this.editCancel(evt.target.value);
						}
						// If user perss enter key
						if(evt.keyCode === 13) {
							this.editDone(evt.target.value);
						}
					}
				}.bind(this));

			}
		},
		buildHTML: {
			value: function() {
				var checkbox = document.createElement('INPUT'),
					label = document.createElement('LABEL'),
					input = document.createElement('INPUT'),
					span = document.createElement('SPAN');

				checkbox.type = 'checkbox';
				checkbox.className = 'mark-complete'
				label.className = 'todo-label';
				label.innerHTML = this.title;
				input.type = 'text';
				input.value = this.title;
				input.className = 'edit-todo';
				span.className = 'delete-todo';
				span.innerHTML = '&times;';

				this.__el.id = getId();
				this.__el.appendChild(checkbox);
				this.__el.appendChild(label);
				this.__el.appendChild(input);
				this.__el.appendChild(span);
			}
		},
		editTodo: {
			value: function() {
				this.__el.classList.add('editing');
				this.__el.querySelector('.edit-todo').focus();
			}
		},
		editDone: {
			value: function(value) {
				if(value.trim() === '') {
					this.editCancel(value);
					return;
				}
				this.title = value;
				this.__el.querySelector('.todo-label').innerHTML = value;
				this.__el.classList.remove('editing');
			}
		},
		editCancel: {
			value: function(value) {
				if(value.trim() !== this.title) {
					this.__el.querySelector('.edit-todo').value = this.title;
				}
				this.__el.classList.remove('editing');
			}
		}
	});

	/*// Create Todo Item if available in HTML
	var createTodoItems = function(itemElements) { 
		var items = [];
		[].forEach.call(itemElements, function(el, index, array) {			
			var item = new TodoItem(el);
			item.bindEvents();
			items.push(item);
		});
		return items;
	};*/

	var TodoList = function(element) {
		EventTarget.call(this);
		//var items = element.querySelectorAll('li');
		Object.defineProperties(this, {
			__el: {
				value: element
			},
			items: {
				value: [], //createTodoItems(items)
				writable: true
			}
		});
	};
	TodoList.prototype = Object.create(EventTarget.prototype, {
		getItemIndex: {
			value: function(todo) {
				return this.items.findIndex(function(item) {
						return (item.__el.id == todo.__el.id);
					});
			}
		},
		addTodo: {
			value: function(newTodoTitle) {
				var item = new TodoItem(newTodoTitle);

				item.addListener('tododeleted', function(evt) {
					this.deleteTodo(evt.target);
				}.bind(this));

				item.addListener('todocompleted',  function(evt) {
					this.markCompleted(evt.target);
				}.bind(this));

				this.items.push(item);
				this.appendTo(item.__el);

				this.__fire({
					type: 'listupdated'
				});

				console.log('New Todo Added');
			}
		},
		deleteTodo: {
			value: function(todo) {
				var index = this.getItemIndex(todo),
					item = this.items[index];

				this.items.splice(index, 1);
				this.__el.removeChild(todo.__el);

				this.__fire({
					type: 'listupdated'
				});

				item = null;
			}
		},
		markCompleted: {
			value: function(item) {
				var label = item.__el.querySelector('.todo-label');
				
				(item.completed) 
					? label.classList.add('completed') 
					: label.classList.remove('completed');

				this.__fire({
					type: 'listupdated'
				});

				this.__fire({
					type: 'todocompleted'
				});
			}
		},
		markAllCompleted: {
			value: function(value){
				this.items.forEach(function(item, index, array) {
					item.__el.querySelector('.mark-complete').checked = value;
					item.completed = value;
					this.markCompleted(item);
				}.bind(this));
			}
		},
		clearCompleted: {
			value: function() {
				this.items = this.items.filter(function(item) {
					if(item.completed) {
						this.__el.removeChild(item.__el);
					}
					return !item.completed;
				}.bind(this));
			}
		},
		filterChanged: {
			value: function(filter) {
				if(filter === 'all') {
					this.items.forEach(function(item) {
						item.__el.style.display = 'block';
					});
				}
				if(filter === 'active') {
					this.items.forEach(function(item) {
						item.__el.style.display = (item.completed) ? 'none' : 'block';
					});
				}
				if(filter === 'completed') {
					this.items.forEach(function(item) {
						item.__el.style.display = (item.completed) ? 'block' : 'none';
					});
				}
			}
		},
		appendTo: {
			value: function(el) {
				this.__el.appendChild(el);
			}
		}
	});

	// Todo Info construction function
	var TodoInfo = function(element) {
		EventTarget.call(this);
		Object.defineProperties(this, {
			__el: {
				value: element
			}
		});
		this.bindEvents();
	};
	TodoInfo.prototype = Object.create(EventTarget.prototype, {
		updateTotal: {
			value: function(total) {
				var totalElement = this.__el.querySelector('#totalTodos'),
					currentTotal = totalElement.innerHTML;
				if(currentTotal == total) {
					return;
				}
				totalElement.innerHTML = total;
			}
		},
		updateRemaining: {
			value: function(remaining) {
				var remainingElement = this.__el.querySelector('#remainingTodos'),
					checkboxElement = this.__el.querySelector('.select-all'),
					currentRemaining = remainingElement.innerHTML;
				if(currentRemaining == remaining) {
					return;
				}
				remainingElement.innerHTML = remaining;
				checkboxElement.checked = (remaining === 0) ? true : false;
			}
		},
		bindEvents: {
			value: function() {
				
				this.__el.querySelector('.select-all').addEventListener('change', function(evt) {
					this.__fire({
						type: 'allcompleted',
						checked: evt.target.checked
					});
				}.bind(this));

			}
		}

	});

	// Todo Filter Constructor function
	var TodoFilter = function(element) {
		EventTarget.call(this);
		Object.defineProperties(this, {
			__el: {
				value: element
			}
		});
		this.bindEvents();
	};
	TodoFilter.prototype = Object.create(EventTarget.prototype, {
		enableClearButton: {
			set: function(value) { 
				this.__el.querySelector('.clear-completed').disabled = value;
			}
		},
		bindEvents: {
			value: function() {
				this.__el.addEventListener('click', function(evt) {
					// If user click on filter button
					if(evt.target.classList.contains('filterBtn')) {
						var filter = evt.target.attributes['data-filter'].value,
							activeFilter = this.__el.parentElement.querySelector('.active');

						activeFilter.classList.remove('active');
						evt.target.classList.add('active');
						this.__fire({
							type: 'filterchanged',
							filter: filter
						});
					}
					// If user click on Clear Completed button
					if(evt.target.classList.contains('clear-completed')) {
						this.__fire({
							type: 'clearcompleted'
						});
					}
				}.bind(this));
			}
		}
	});

	//Todo Input Constructor Function
	var TodoInput = function(element) {
		EventTarget.call(this);
		Object.defineProperties(this, {
			__el: {
				value: element
			}
		});
		this.bindEvents();
	}
	TodoInput.prototype = Object.create(EventTarget.prototype, {
		bindEvents: {
			value: function() {
				this.__el.addEventListener('keydown', function(evt) {
					if(evt.keyCode == 13) { 
						if(evt.target.value.trim() == '') return;
						this.__fire({
							type: 'todoadded',
							todoTitle: evt.target.value
						});
						evt.target.value = '';
					}
				}.bind(this));
			}
		}
	});

	// Todo List Constructor function
	var Todo = function(inputElement, listElement, infoElement, filterElement) {
		EventTarget.call(this);
		Object.defineProperties(this, {
			input: {
				value: new TodoInput(inputElement)
			},
			list: {
				value: new TodoList(listElement)
			},
			info: {
				value: new TodoInfo(infoElement)
			},
			filter: {
				value: new TodoFilter(filterElement)
			}
		});
		this.bindEvents();
	};
	Todo.prototype = Object.create(EventTarget.prototype, {
		totalTodos: {
			get: function() {
				return this.list.items.length;
			}
		},
		remainingTodos: {
			get: function() {
				return this.list.items.filter(function(item) {
					return !item.completed;
				}).length;
			}
		},
		bindEvents: {
			value: function() { 

				this.input.addListener('todoadded', function(evt) {
					this.list.addTodo(evt.todoTitle);
				}.bind(this));
				
				this.list.addListener('listupdated', function(evt) {
					this.info.updateTotal(this.totalTodos);
					this.info.updateRemaining(this.remainingTodos);
				}.bind(this));
				
				this.list.addListener('todocompleted', function(evt) {
					if(this.filter.enableClearButton) {
						return;
					}
					this.filter.enableClearButton = (this.remainingTodos < this.totalTodos) ? false : true;
				}.bind(this));

				this.info.addListener('allcompleted', function(evt) {
					this.list.markAllCompleted(evt.checked);
				}.bind(this));

				this.filter.addListener('clearcompleted', function(evt) {
					this.list.clearCompleted();
				}.bind(this));

				this.filter.addListener('filterchanged', function(evt) {
					this.list.filterChanged(evt.filter);
				}.bind(this));

			}
		}
	});

	// Create Todo Object
	oojs.createTodo = function(elementId) {
		var todoElement = document.getElementById(elementId),
			todoInputElement = todoElement.querySelector('#todoInput'),
			todoListElement = todoElement.querySelector('#todoList'),
			todoInfoElement = todoElement.querySelector('#todoInfo'),
			todoFilterElement = todoElement.querySelector('#todoFilter');
		return new Todo(todoInputElement, todoListElement, todoInfoElement, todoFilterElement);
	};

	return oojs;

}(oojs || {}));	