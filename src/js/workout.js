window.addEventListener("DOMContentLoaded", () => { loadWorkouts() });

const workoutNameInt = document.querySelector('#workoutNameInt');
const addWorkoutBtn = document.querySelector('#addWorkoutBtn');
const workoutsList = document.querySelector('#workoutsList');
const emptyState = document.querySelector('#emptyState');
const workoutTpl = document.querySelector('#workoutTpl');

addWorkoutBtn.addEventListener('click', addWorkout)

let workouts = [];


// function init() {
//     workouts.forEach(addWorkout);
// }

function loadWorkouts() {
    const savedWorkouts = localStorage.getItem('workouts');
    
    if (savedWorkouts) {
        workouts = JSON.parse(savedWorkouts) || [];
    } else {
        console.log('Workout not found in local storage.');
    }

    workouts.forEach((workout) => {       
        const clone = workoutTpl.content.cloneNode(true);
        const title = clone.querySelector('.workout-title');

        // Taking the saved ID (the one that came from addWorkout()) 
        // and putting it back on the HTML element
        clone.querySelector('.workout').dataset.id = workout.id;

        title.textContent = workout.name;       
        workoutsList.appendChild(clone);  
    });

    if (workouts.length > 0) {
        emptyState.style.display = 'none';
    }
}

function  addWorkout() {
    const input = workoutNameInt.value.trim();
    if (!input) return alert("Type in your workout");
    
    const clone = workoutTpl.content.cloneNode(true);
    const title = clone.querySelector('.workout-title');
    title.textContent = input;
    
    const workoutID = crypto.randomUUID();
    clone.querySelector('.workout').dataset.id = workoutID; 
    
    workoutsList.appendChild(clone);
    
    workouts.push({ 
        id: workoutID,
        name: input,
        exercises: []
    });
    
    workoutNameInt.value = '';
    workoutNameInt.setAttribute('autocomplete', 'off');
    emptyState.style.display = 'none';

    localStorage.setItem('workouts', JSON.stringify(workouts));
}

function handleWorkoutClick(e) {

    const popUpTrigger = e.target.closest('.popUpBtns');
    const deleteBtn = e.target.closest('.deleteWorkout');
    const renameBtn = e.target.closest('.renameWorkout');
    const saveBtn = e.target.closest('.saveBtn');
    
    const origin = popUpTrigger || deleteBtn || renameBtn || saveBtn || e.target;

    // Resolve the workout element, even when clicking inside the popup
    let workoutEl = origin.closest('.workout');
    if (!workoutEl) {
        const popUpEl = origin.closest('.popUp');
        if (popUpEl && popUpEl.dataset && popUpEl.dataset.id) {
            workoutEl = document.querySelector(`.workout[data-id="${popUpEl.dataset.id}"]`);
        }
    }
    if (!workoutEl) return;
    
    const workoutID = workoutEl.dataset.id;
    const workoutObj = workouts.find(workout => workout.id == workoutID);
    
    if (popUpTrigger) {
        const existingPopup = document.querySelector(`.popUp[data-id="${workoutID}"]`);
        // Toggle: if a popup for this workout already exists, remove it; otherwise create it
        if (existingPopup) {
            existingPopup.remove();
            return;
        }

        const div = document.createElement('div');
        div.classList.add('popUp');
        // Link popup to the workout so actions know the context
        div.dataset.id = workoutID;
        document.body.appendChild(div);

        const workoutAction = workoutEl.querySelector('.workout-actions').cloneNode(true);
        div.appendChild(workoutAction);
        // Let CSS control layout; ensure flex for vertical buttons
        workoutAction.style.display = 'flex';

        return;
    }
    
    if (deleteBtn) {
        // Remove from in-memory list
        workouts = workouts.filter(workout => workout.id !== workoutID);
        // Persist updated list
        localStorage.setItem('workouts', JSON.stringify(workouts));
        // Remove from DOM
        workoutEl.remove();
        // Remove any open popup for this workout
        emptyState.style.display = workouts.length > 0 ? 'none' : '';
        const openPopup = document.querySelector(`.popUp[data-id="${workoutID}"]`);
        if (openPopup) openPopup.remove();
        return;
    
    } 

    // closest searches up the DOM tree for elements
    
    if (renameBtn) {

        const workoutTitle = workoutEl.querySelector('.workout-title');
        
        workoutTitle.innerHTML = `
        <input type='text' id="text" value="${workoutObj.name}"/>
        <button class="saveBtn">Save</button>
        `;
        
        const input = workoutEl.querySelector('#text');
        input.classList.add('renameInt');
        input.focus();
        input.setSelectionRange(0, input.value.length);
        // Close popup after initiating rename
        const openPopup = document.querySelector(`.popUp[data-id="${workoutID}"]`);
        if (openPopup) openPopup.remove();
        
        return;
    }

    if (saveBtn) {
        const input = workoutEl.querySelector('input');
        const newName = input.value.trim();
        if (!newName) return;
        
        const workoutTitle = workoutEl.querySelector('.workout-title');
        workoutTitle.textContent = newName;
        
        workoutObj.name = newName;
        localStorage.setItem('workouts', JSON.stringify(workouts));
        return;
    }
    
    // !! mean it converts the result into a simple true/false
    const isEditing = !!workoutEl.querySelector('input');
    // for tagName the user clicked inside an input box
    if (isEditing || e.target.closest('button') || e.target.tagName === 'input') return;

    window.location.href = `workout-detail.html?id=${workoutID}`;

}

// Handle clicks within the workouts list (cards)
workoutsList.addEventListener('click', handleWorkoutClick);
// Also handle clicks inside the popup overlay
document.addEventListener('click', (e) => {
    if (e.target.closest('.popUp')) {
        handleWorkoutClick(e);
    }
});
