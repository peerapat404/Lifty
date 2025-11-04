const params = new URLSearchParams(window.location.search);
const workoutID = params.get('id');

let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
let workout = workouts.find(w => w.id === workoutID);

const exerciseTpl = document.querySelector('#exerciseTpl');
const exercisesList = document.querySelector('#exercisesList');
const addExerciseBtn = document.querySelector('#addExerciseBtn');

// Set workout title and render existing exercises
function init() {
    const title = document.querySelector('#workout-title');
    if (workout) {
        title.textContent = workout.name;
        // render saved exercises
        (workout.exercises || []).forEach(renderExerciseTpl);
    } else {
        title.textContent = 'Workout';
    }
};

addExerciseBtn.addEventListener('click', () => {
    if (!workout) return; // no workout context
    const newExercise = {
        id: crypto.randomUUID(),
        name: '',
        sets: []
    };

    workout.exercises.push(newExercise);
    renderExerciseTpl(newExercise);
    persistWorkouts();
});

function renderExerciseTpl(exercise) {
    const clone = exerciseTpl.content.cloneNode(true);
    const section = clone.querySelector('.exercise');
    const input = clone.querySelector('.exercise-input');
    const table = clone.querySelector('.sets');
    const tbody = table.querySelector('tbody');

    section.dataset.id = exercise.id;

    if (exercise.name) {
        const h4 = document.createElement('h4');
        h4.className = 'exercise-name';
        h4.textContent = exercise.name.trim();
        input.replaceWith(h4);
    } else {
        if (input) input.value = '';
    }

    tbody.innerHTML = '';

    for (const setObj of exercise.sets) {
        
        const tr = document.createElement('tr');
        tr.dataset.id = setObj.id;

        // first cell: set number
        const tdSet = document.createElement('td');
        tdSet.textContent = setObj.set;

        // second cell: weight as plaintext on initial render
        const tdWeight = document.createElement('td');
        tdWeight.dataset.field = 'weight';
        tdWeight.textContent = setObj.weight ?? '';

        // third cell: reps as plaintext on initial render
        const tdReps = document.createElement('td');
        tdReps.dataset.field = 'reps';
        tdReps.textContent = setObj.reps ?? '';

        tr.append(tdSet, tdWeight, tdReps);
        tbody.appendChild(tr);
    }
    
    exercisesList.appendChild(clone);
}

// Inline editing: input -> h4 and persist name
exercisesList.addEventListener('blur', (e) => {
    if (!e.target.classList.contains('exercise-input')) return;
    const name = e.target.value.trim();
    const exerciseEl = e.target.closest('.exercise');
    if (!exerciseEl) return;
    const exerciseId = exerciseEl.dataset.id;    

    // update model
    const ex = workout && workout.exercises.find(ex => ex.id === exerciseId);
    if (ex) {
        ex.name = name;
        // ex.weight = weightInput;
        persistWorkouts();
    }
    if (name) {
        const h4 = document.createElement('h4');
        h4.classList.add('exercise-name');
        h4.textContent = name;
        e.target.replaceWith(h4);
    }

}, true);

// Click name -> back to input for editing
exercisesList.addEventListener('click', (e) => {
    if (!e.target.classList.contains('exercise-name')) return;
    const currentName = e.target.textContent;
    const input = document.createElement('input');
    input.type = 'text';

    input.classList.add('exercise-input');
    input.value = currentName;
    e.target.replaceWith(input);
    input.focus();
});


exercisesList.addEventListener('click', handleExerciseClick)

function handleExerciseClick(e) {
    const removeBtn = e.target.closest('.removeExercise');
    const addSetBtn = e.target.closest('.addSet');
    
    if(!removeBtn && !addSetBtn) {

      const td = e.target.closest('td[data-field]');
      if (!td || td.querySelector('input')) return;

      const field = td.dataset.field;
      const tr = td.closest('tr'); // the row this cell belongs to
      const setId = tr.dataset.id;
      const exerciseEl = td.closest('.exercise');
      const exerciseId = exerciseEl.dataset.id;

      // Find the right exercise and set object from the workout data
      const exercise = workout.exercises.find(ex => ex.id === exerciseId);
      const setObj = exercise?.sets.find(s => s.id === setId);
      const currentValue = (setObj?.[field] ?? '').toString();

      // Create a new <input> element so the user can edit the value
      const input = document.createElement('input');
      input.type = 'number';
      input.className = 'setInt';
      input.placeholder = field === 'weight' ? 'kg' : 'reps';
      input.dataset.field = field;
      input.value = currentValue;

      td.textContent = '';
      td.appendChild(input);
      input.focus();
      input.select();
      return;
    }
    
    const origin = removeBtn || addSetBtn;
    const exerciseEl = origin.closest('.exercise');
    const exerciseId = exerciseEl.dataset.id;
    
    if (removeBtn) {
        workout.exercises = workout.exercises.filter(ex => ex.id !== exerciseId);
        exerciseEl.remove();
        persistWorkouts();
        return;
    }
    
    if (addSetBtn) {
        const table = exerciseEl.querySelector('.sets');
        const tbody = table.querySelector('tbody');
        const exercise = workout.exercises.find(ex => ex.id === exerciseId); 

        const newSet = {
            id: crypto.randomUUID(),
            set: exercise.sets.length + 1,
            weight: '',
            reps: ''
        }

        // Table row ID
        const tr = document.createElement('tr');
        tr.dataset.id = newSet.id

        const tdSet = document.createElement('td');
        tdSet.textContent = newSet.set;

        const tdWeight = document.createElement('td');
        tdWeight.dataset.field = 'weight';
        tdWeight.innerHTML = 
          `
            <input type="number" name="kgInt" class="setInt" placeholder="kg" data-field="weight"/>
          `;

        const tdRep = document.createElement('td');
        tdRep.dataset.field = 'reps';
        tdRep.innerHTML = 
          `
            <input type="number" name="repsInt" class="setInt" placeholder="0" data-field="reps"/>
          `;

        tr.append(tdSet, tdWeight, tdRep);   
        tbody.appendChild(tr);
        
        exercise.sets.push(newSet);
        persistWorkouts();
    }
}

// Handle blur: commit input -> text (stay in the same <td>)
exercisesList.addEventListener('blur', (e) => {
  if (!e.target.classList.contains('setInt')) return;

  const input = e.target;
  const value = input.value.trim();

  const td = input.closest('td');
  const field = input.dataset.field;
  const tr = input.closest('tr');
  const setId = tr.dataset.id;
  const exerciseEl = input.closest('.exercise');
  const exerciseId = exerciseEl.dataset.id;

  const exercise = workout.exercises.find(ex => ex.id === exerciseId);
  // This ?. is called optional chaining
  // ?. check that exercise is exist before trying to look inside it
  const setObj = exercise?.sets.find(s => s.id === setId);

  // Check for the set AND know what field we're updating
  if (setObj && field) {
    // Change the value of the chosen field to what the user typed
    setObj[field] = value;
  }
  
  if (!value) return;
  td.textContent = value;
  console.log(td);
  
  persistWorkouts();
}, true);

// 2) CLICK: turn a plain-text cell back into an input
exercisesList.addEventListener('click', (e) => {
  // Use the clicked cell, not document.querySelector('td')
  const td = e.target.closest('td[data-field]');
  if (!td) return;                            // not a clickable data cell
  if (td.querySelector('input.setInt')) return; // already editing

  const field = td.dataset.field; // "weight" | "reps"
  const tr = td.closest('tr');
  const setId = tr.dataset.id;
  const exerciseEl = td.closest('.exercise');
  const exerciseId = exerciseEl.dataset.id;

  const exercise = workout.exercises.find(ex => ex.id === exerciseId);
  const setObj = exercise?.sets.find(s => s.id === setId);
  // if setObj exists, get the value inside it for the key stored in field
  const currentValue = (setObj?.[field] ?? '').toString();

  td.textContent = '';

  const input = document.createElement('input');
  input.type = 'number';
  input.className = 'setInt';
  input.placeholder = field === 'weight' ? 'kg' : 'reps';
  input.dataset.field = field;
  input.value = currentValue;

  td.appendChild(input);
  input.focus();
  input.select();
});

function persistWorkouts() {
    localStorage.setItem('workouts', JSON.stringify(workouts));
}

init();
